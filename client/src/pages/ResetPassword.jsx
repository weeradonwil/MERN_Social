import React, { useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate, Link } from 'react-router-dom'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { token } = useParams()
    const navigate = useNavigate()

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
                    <input
                        type="password"
                        placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
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
