import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setIsLoading(true)

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
                { email }
            )

            setMessage(response?.data?.message || 'ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบกล่องจดหมาย')
        } catch (err) {
            const status = err?.response?.status
            const serverMessage = err?.response?.data?.message

            if (status === 404) {
                setError('ไม่พบอีเมลนี้ในระบบ')
            } else if (status === 422) {
                setError(serverMessage || 'กรุณากรอกอีเมลให้ถูกต้อง')
            } else {
                setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="register">
            <div className="register__container">
                <h2>ลืมรหัสผ่าน</h2>
                <p style={{ color: 'var(--color-light)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
                </p>

                {message && <p style={{ color: 'green', marginBottom: '1rem' }}>{message}</p>}
                {error && <p className="form__error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="อีเมล"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn" disabled={isLoading}>
                        {isLoading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                    </button>
                </form>

                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Link to="/login">← กลับไปหน้าเข้าสู่ระบบ</Link>
                </p>
            </div>
        </section>
    )
}

export default ForgotPassword