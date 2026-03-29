const HttpError = require('../models/errorModel')
const UserModel = require('../models/userModel')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const sendEmail = require("../utils/mailer")

// ===== Forgot Password =====
// POST: api/auth/forgot-password
// Unprotected
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        if (!email) return next(new HttpError("กรุณากรอกอีเมล", 422))

        const user = await UserModel.findOne({ email: email.toLowerCase() })
        if (!user) return next(new HttpError("ไม่พบอีเมลนี้ในระบบ", 404))

        // สร้าง reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

        user.resetPasswordToken = hashedToken
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000
        await user.save()

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

        await sendEmail({
            to: user.email,
            subject: "รีเซ็ตรหัสผ่านของคุณ",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e84393;">รีเซ็ตรหัสผ่าน</h2>
            <p>สวัสดี ${user.fullName || user.email},</p>
            <p>คุณได้ขอรีเซ็ตรหัสผ่าน กรุณากดปุ่มด้านล่างภายใน <strong>30 นาที</strong></p>
            <a href="${resetUrl}" style="display:inline-block; padding: 12px 24px; background:#e84393; color:white; text-decoration:none; border-radius:8px; margin: 16px 0;">
                รีเซ็ตรหัสผ่าน
            </a>
            <p style="word-break: break-all;">หากปุ่มกดไม่ได้ ให้คัดลอกลิงก์นี้ไปเปิด:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลนี้</p>
        </div>
    `
        })

        console.log("SendGrid: ส่งอีเมลสำเร็จ")

        res.json({ message: "ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบกล่องจดหมาย" })

    } catch (error) {
        console.error("forgotPassword error:", error)

        const message =
            process.env.NODE_ENV === "development"
                ? (error.message || "Server Error")
                : "เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง"

        return next(new HttpError(message, 500))
    }
}


// ===== Reset Password =====
// POST: api/auth/reset-password/:token
// Unprotected
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params
        const { password, confirmPassword } = req.body

        if (!password || !confirmPassword) {
            return next(new HttpError("กรุณากรอกรหัสผ่านให้ครบ", 422))
        }
        if (password !== confirmPassword) {
            return next(new HttpError("รหัสผ่านไม่ตรงกัน", 422))
        }
        if (password.length < 8) {
            return next(new HttpError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", 422))
        }
        if (!/[A-Z]/.test(password)) {
            return next(new HttpError("รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)", 422))
        }
        if (!/[!@#$%]/.test(password)) {
            return next(new HttpError("รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%)", 422))
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        })

        if (!user) {
            return next(new HttpError("ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง", 400))
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()

        res.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่" })

    } catch (error) {
        return next(new HttpError(error.message || "Server Error", 500))
    }
}

module.exports = { forgotPassword, resetPassword }