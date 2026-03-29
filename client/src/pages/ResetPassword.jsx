import React, { useState } from 'react'
import axios from 'axios'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useParams, useNavigate, Link } from 'react-router-dom'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { token } = useParams()
    const navigate = useNavigate()

    const requirements = [
        { label: "อย่างน้อย 8 ตัวอักษร", met: password.length >= 8 },
        { label: "ตัวพิมพ์ใหญ่ 1 ตัว (A-Z)", met: /[A-Z]/.test(password) },
        { label: "อักขระพิเศษ 1 ตัว (!@#$%)", met: /[!@#$%]/.test(password) },
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setIsLoading(true)
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`,
                { password, confirmPassword }
            )
            setMessage(response?.data?.message)
            setTimeout(() => navigate('/login'), 2500)
        } catch (err) {
            setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด')
        }
        setIsLoading(false)
    }

    return (
        <section className="register">
            <div className="register__container">
                <h2>ตั้งรหัสผ่านใหม่</h2>

                {message && <p style={{ color: 'green', marginBottom: '1rem' }}>{message} (กำลังพาไปหน้า Login...)</p>}
                {error && <p className="form__error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="password__controller">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="รหัสผ่านใหม่"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <span onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    {password.length > 0 && (
                        <ul style={{ listStyle: "none", padding: "4px 0", margin: "0 0 8px 0", fontSize: "12px" }}>
                            {requirements.map((req, i) => (
                                <li key={i} style={{ color: req.met ? "#4caf50" : "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span>{req.met ? "✓" : "✗"}</span> {req.label}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="password__controller">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="ยืนยันรหัสผ่านใหม่"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <button type="submit" className="btn" disabled={isLoading}>
                        {isLoading ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
                    </button>
                </form>

                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Link to="/login">← กลับไปหน้าเข้าสู่ระบบ</Link>
                </p>
            </div>
        </section>
    )
}

export default ResetPassword