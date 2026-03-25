import React, { useState } from 'react'
import axios from 'axios'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {
  const [userData, setUserData] = useState({
    fullName: "", email: "", password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // function to change userData
  const changeInputHandler = (e) => {
    setUserData(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }
   // functin to register user
  const registerUser = async (e) => {
    e.preventDefault();

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง เช่น example@gmail.com")
      return
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, userData);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message);
    }
  }

  return (
    <section className="register">
      <div className="container register__container">
        <h2 style="text-align: center;">สมัครสมาชิก</h2>
        <form onSubmit={registerUser} >
          {error && <p className="form__error-message">{error}</p>}
          <input type="text" name='fullName' placeholder='Full Name' onChange={changeInputHandler} autoFocus />

          <input type="email" name='email' placeholder='Email เช่น example@gmail.com' onChange={changeInputHandler} />

          <div className="password__controller">
            <input type={showPassword ? "text" : "password"} name='password' placeholder='Password' onChange={changeInputHandler} />
            <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>

          </div>

          <div className="password__controller">
            <input type={showPassword ? "text" : "password"} name='confirmPassword' placeholder='ConfirmPassword' onChange={changeInputHandler} />
            <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
          </div>

          <p>มีบัญชีอยู่แล้วใช่ไหม? <Link to="/login">เข้าสู่ระบบ</Link> </p>
          <button type='submit' className='btn primary' style="display: block; margin: 0 auto;">สมัครสมาชิก</button>


        </form>
      </div>
    </section>
  )
}

export default Register