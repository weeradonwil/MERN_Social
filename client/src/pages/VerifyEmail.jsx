import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'

const VerifyEmail = () => {
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const { token } = useParams()

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`
                )
                setMessage(response?.data?.message)
            } catch (err) {
                setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด')
            }
            setIsLoading(false)
        }
        verify()
    }, [token])

    return (
        <section className="register">
            <div className="register__container">
                <h2>ยืนยันอีเมล</h2>
                {isLoading && <p>กำลังยืนยันอีเมล...</p>}
                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p className="form__error-message">{error}</p>}
                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Link to="/login">← ไปหน้าเข้าสู่ระบบ</Link>
                </p>
            </div>
        </section>
    )
}

export default VerifyEmail