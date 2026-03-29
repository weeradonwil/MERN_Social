const HttpError = require('../models/errorModel')
const UserModel = require('../models/userModel')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const uuid = require("uuid").v4;
const fs = require("fs")
const path = require("path")
const cloudinary = require("../utils/cloudinary")
const sendEmail = require("../utils/mailer")

// Register user
// Post : api - users - register
// Unprotected
const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        if (!fullName || !email || !password || !confirmPassword) {
            return next(new HttpError("กรุณากรอกข้อมูลให้ครบทุกช่อง", 422));
        }

        const lowercasedEmail = email.trim().toLowerCase();

        const emailExists = await UserModel.findOne({ email: lowercasedEmail });
        if (emailExists) {
            return next(new HttpError("อีเมลนี้มีอยู่แล้ว", 422));
        }

        if (password !== confirmPassword) {
            return next(new HttpError("รหัสผ่านไม่ตรงกัน", 422));
        }

        if (password.length < 8) {
            return next(new HttpError("รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร", 422));
        }

        if (!/[A-Z]/.test(password)) {
            return next(new HttpError("รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)", 422));
        }

        if (!/[!@#$%]/.test(password)) {
            return next(new HttpError("รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%)", 422));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await UserModel.create({
            fullName,
            email: lowercasedEmail,
            password: hashedPassword
        });

        // ส่ง Welcome Email
        try {
            await sendEmail({
                to: lowercasedEmail,
                subject: "ยินดีต้อนรับสู่ระบบ! 🎉",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #e84393;">ยินดีต้อนรับ, ${fullName}! 🎉</h2>
                        <p>ขอบคุณที่สมัครสมาชิกกับเรา บัญชีของคุณพร้อมใช้งานแล้ว</p>
                        <p>อีเมลที่ลงทะเบียน: <strong>${lowercasedEmail}</strong></p>
                        <a href="${process.env.CLIENT_URL}/login" style="display:inline-block; padding: 12px 24px; background:#e84393; color:white; text-decoration:none; border-radius:8px; margin: 16px 0;">
                            เข้าสู่ระบบ
                        </a>
                        <p style="color: #999; font-size: 12px;">หากคุณไม่ได้สมัครสมาชิก กรุณาละเว้นอีเมลนี้</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error("Welcome email error:", emailError);
        }

        res.status(201).json(newUser);
    } catch (error) {
        return next(new HttpError(error.message || "Server Error", 500));
    }
};

//===== Login user =====
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new HttpError("Fill in all fields", 422))
        }
        const lowerCasedEmail = email.toLowerCase();
        const user = await UserModel.findOne({ email: lowerCasedEmail })
        if (!user) {
            return next(new HttpError("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 422))
        }
        const { uPassword, ...userInfo } = user;
        const comparedPass = await bcrypt.compare(password, user?.password);
        if (!comparedPass) {
            return next(new HttpError("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 422))
        }
        const token = await jwt.sign({ id: user?._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.status(200).json({ token, id: user?._id, profilePhoto: user?.profilePhoto });
    } catch (error) {
        return next(new HttpError(error))
    }
}

//===== Get User =====
const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id).select("-password")
        if (!user) return next(new HttpError("ไม่พบผู้ใช้", 422))
        res.status(200).json(user)
    } catch (error) {
        return next(new HttpError(error))
    }
}

//===== GetUsers =====
const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find().sort({ createdAt: -1 }).limit(10);
        res.json(users);
    } catch (error) {
        return next(new HttpError(error))
    }
}

//===== Edit User =====
const editUser = async (req, res, next) => {
    try {
        const { fullName, bio } = req.body;
        const editedUser = await UserModel.findByIdAndUpdate(req.user.id, { fullName, bio }, { new: true })
        res.json(editedUser).status(200)
    } catch (error) {
        return next(new HttpError(error))
    }
}

//===== Follow-Unfollow User =====
const followUnfollowUser = async (req, res, next) => {
    try {
        const userToFollowId = req.params.id;
        if (req.user.id == userToFollowId) {
            return next(new HttpError("คุณไม่สามารถกดติดตามหรือเลิกติดตามตัวเองได้", 422))
        }
        const currentUser = await UserModel.findById(req.user.id);
        const isFollowing = currentUser?.following?.includes(userToFollowId);
        if (!isFollowing) {
            const updatedUser = await UserModel.findByIdAndUpdate(userToFollowId, { $push: { followers: req.user.id } }, { new: true })
            await UserModel.findByIdAndUpdate(req.user.id, { $push: { following: userToFollowId } }, { new: true })
            res.json(updatedUser)
        } else {
            const updatedUser = await UserModel.findByIdAndUpdate(userToFollowId, { $pull: { followers: req.user.id } }, { new: true })
            await UserModel.findByIdAndUpdate(req.user.id, { $pull: { following: userToFollowId } }, { new: true })
            res.json(updatedUser)
        }
    } catch (error) {
        return next(new HttpError(error))
    }
}

//===== Change User Profile Photo =====
const changeUserAvatar = async (req, res, next) => {
    try {
        if (!req.files.avatar) return next(new HttpError("โปรดเลือกรูปภาพ", 422))
        const { avatar } = req.files;
        if (avatar.size > 500000) return next(new HttpError("รูปโปรไฟล์ใหญ่เกินไป ควรมีขนาดเล็กกว่า 500kb"))
        let fileName = avatar.name;
        let splittedFilename = fileName.split(".");
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
        avatar.mv(path.join(__dirname, "..", "uploads", newFilename), async (err) => {
            if (err) return next(new HttpError(err))
            const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFilename), { resource_type: "image" });
            if (!result.secure_url) return next(new HttpError("ไม่สามารถอัปโหลดรูปภาพไปยัง Cloudinary ได้", 422))
            const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, { profilePhoto: result?.secure_url }, { new: true })
            res.status(200).json(updatedUser)
        })
    } catch (error) {
        return next(new HttpError(error));
    }
};

//===== Delete User =====
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params
        if (req.user.id !== id) return next(new HttpError("คุณไม่มีสิทธิ์ลบบัญชีนี้", 403))
        const user = await UserModel.findById(id)
        if (!user) return next(new HttpError("ไม่พบผู้ใช้", 404))
        await UserModel.updateMany({ following: id }, { $pull: { following: id } })
        await UserModel.updateMany({ followers: id }, { $pull: { followers: id } })
        const PostModel = require('../models/postModel')
        await PostModel.deleteMany({ creator: id })
        await UserModel.findByIdAndDelete(id)
        res.json({ message: "ลบบัญชีสำเร็จ" })
    } catch (error) {
        return next(new HttpError(error))
    }
}

module.exports = { registerUser, loginUser, getUser, getUsers, editUser, followUnfollowUser, changeUserAvatar, deleteUser }