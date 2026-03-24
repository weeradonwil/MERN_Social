import React, { useState } from 'react'
import axios from 'axios'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { userActions } from '../store/user-slice'

const Login = () => {
  const [userData, setUserData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const changeInputHandler = (e) => {
    setUserData(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }

  const loginUser = async (e) => {
    e.preventDefault()
    try {
      setError("")

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        userData
      )

      if (response.status === 200) {
        dispatch(userActions.ChangeCurrentUser(response.data))
        localStorage.setItem("currentUser", JSON.stringify(response.data))
        navigate('/')
      }
    } catch (error) {
      setError(error.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ")
    }
  }

  return (
    <section className="register">
      <div className="container register__container">
        <h2>เข้าสู่ระบบ</h2>
        <form onSubmit={loginUser}>
          {error && <p className="form__error-message">{error}</p>}

          <input
            type="text"
            name="email"
            placeholder="Email"
            onChange={changeInputHandler}
          />

          <div className="password__controller">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={changeInputHandler}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <p>ยังไม่มีบัญชีใช่ไหม? <Link to="/register">สมัครสมาชิก</Link></p>
          <p><Link to="/forgot-password">ลืมรหัสผ่าน?</Link></p>
          <button type="submit" className="btn primary">เข้าสู่ระบบ</button>
        </form>
      </div>
    </section>
  )
}

export default Login