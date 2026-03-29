import React, { useState } from 'react'
import axios from 'axios'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {
  const [userData, setUserData] = useState({
    fullName: "", email: "", password: "", confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const changeInputHandler = (e) => {
    setUserData(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
  }

  const validatePassword = (password) => {
    if (password.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
    if (!/[A-Z]/.test(password)) return "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)"
    if (!/[!@#$%]/.test(password)) return "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%)"
    return null
  }

  const registerUser = async (e) => {
    e.preventDefault();
    setError("")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง เช่น example@gmail.com")
      return
    }

    const passwordError = validatePassword(userData.password)
    if (passwordError) { setError(passwordError); return }

    if (userData.password !== userData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, userData);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message);
    }
  }

  // Realtime password checklist
  const pw = userData.password
  const requirements = [
    { label: "อย่างน้อย 8 ตัวอักษร", met: pw.length >= 8 },
    { label: "ตัวพิมพ์ใหญ่ 1 ตัว (A-Z)", met: /[A-Z]/.test(pw) },
    { label: "อักขระพิเศษ 1 ตัว (!@#$%)", met: /[!@#$%]/.test(pw) },
  ]

  return (
    <section className="register">
      <div className="container register__container">
        <h2 style={{ textAlign: "center" }}>สมัครสมาชิก</h2>
        <form onSubmit={registerUser}>
          {error && <p className="form__error-message">{error}</p>}
          <input type="text" name='fullName' placeholder='Full Name' onChange={changeInputHandler} autoFocus />
          <input type="email" name='email' placeholder='Email เช่น example@gmail.com' onChange={changeInputHandler} />

          <div className="password__controller">
            <input type={showPassword ? "text" : "password"} name='password' placeholder='Password' onChange={changeInputHandler} />
            <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
          </div>

          {/* Password requirements checklist */}
          {pw.length > 0 && (
            <ul style={{ listStyle: "none", padding: "4px 0", margin: "0 0 8px 0", fontSize: "12px" }}>
              {requirements.map((req, i) => (
                <li key={i} style={{ color: req.met ? "#4caf50" : "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{req.met ? "✓" : "✗"}</span> {req.label}
                </li>
              ))}
            </ul>
          )}

          <div className="password__controller">
            <input type={showPassword ? "text" : "password"} name='confirmPassword' placeholder='ConfirmPassword' onChange={changeInputHandler} />
            <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
          </div>

          <p>มีบัญชีอยู่แล้วใช่ไหม? <Link to="/login">เข้าสู่ระบบ</Link></p>
          <button type="submit" className="btn primary" style={{ display: "block", margin: "0 auto" }}>สมัครสมาชิก</button>
        </form>
      </div>
    </section>
  )
}

export default Register