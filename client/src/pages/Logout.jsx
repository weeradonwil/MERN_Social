import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { userActions } from '../store/user-slice'

const Logout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(userActions.ChangeCurrentUser({}))
    localStorage.setItem("currentUser", null)
    navigate('/login')
  }, [])

  return (
    <div>Logout</div>
  )
}

export default Logout