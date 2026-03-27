import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FaCheck } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'

const DEFAULT_AVATAR = "https://res.cloudinary.com/dtbqrwpbr/image/upload/v1774097734/5951752_hkdrek.png"

export const Widgets = () => {
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [followingMap, setFollowingMap] = useState({})

  const token = useSelector(state => state?.user?.currentUser?.token)
  const loggedInUserId = useSelector(state => state?.user?.currentUser?.id)

  // GET SUGGESTED FRIENDS (users ที่ยังไม่ได้ follow)
  const getUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      // กรอง user ตัวเองออก และกรอง user ที่ follow แล้วออกด้วย
      const filtered = response?.data?.filter(u => {
        const isMe = u._id === loggedInUserId
        const isFollowing = u.followers?.includes(loggedInUserId)
        return !isMe && !isFollowing
      })
      setUsers(filtered)

      // ตั้งค่า follow state เริ่มต้น
      const map = {}
      filtered.forEach(u => {
        map[u._id] = u.followers?.includes(loggedInUserId) || false
      })
      setFollowingMap(map)
    } catch (error) {
      console.log(error)
    }
  }

  // GET CONVERSATIONS (Recent Messages)
  const getConversations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(response?.data || [])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (token) {
      getUsers()
      getConversations()

      const interval = setInterval(() => {
        getUsers()
        getConversations()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [token])

  // FOLLOW / UNFOLLOW
  const handleFollowUnfollow = async (userId) => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}/follow-unfollow`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setFollowingMap(prev => ({ ...prev, [userId]: !prev[userId] }))
    } catch (error) {
      console.log(error)
    }
  }

  // DISMISS (ซ่อน user ออกจาก Suggested)
  const handleDismiss = (userId) => {
    setUsers(prev => prev.filter(u => u._id !== userId))
  }

  return (
    <div className="widgets">
      {/* Suggested Friends */}
      <div className="friendRequests">
        <h3>Suggested Friends</h3>
        {users.slice(0, 4).map(user => (
          <div key={user._id} className="friendRequest">
            <div className="friendRequest__image">
              <Link to={`/users/${user._id}`}>
                <img
                  src={user?.profilePhoto || DEFAULT_AVATAR}
                  alt={user?.fullName}
                  onError={e => { e.target.src = DEFAULT_AVATAR }}
                />
              </Link>
            </div>
            <div className="friendRequest__info">
              <Link to={`/users/${user._id}`}>
                <h5 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>{user?.fullName}</h5>
              </Link>
              <small style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px', display: 'block' }}>{user?.email}</small>
            </div>
            <div className="friendRequest__actions">
              <button
                className="friendRequest__actions-approve"
                onClick={() => handleFollowUnfollow(user._id)}
                title={followingMap[user._id] ? 'Unfollow' : 'Follow'}
              >
                <FaCheck />
              </button>
              <button
                onClick={() => handleDismiss(user._id)}
                title="Dismiss"
              >
                <IoClose />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Messages */}
      <div className="messageList">
        <h3>Recent Messages</h3>
        {conversations.length === 0 ? (
          <p style={{ color: 'var(--color-light)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
            No messages yet
          </p>
        ) : (
          conversations.slice(0, 5).map(conv => {
            const participant = conv?.participants?.[0]
            if (!participant) return null
            return (
              <Link
                to={`/messages/${participant._id}`}
                key={conv._id}
                className="messageList__item"
              >
                <div className="messageList__item-details">
                  <img
                    src={participant?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant?.fullName)}&background=random`}
                    alt={participant?.fullName}
                  />
                  <div>
                    <h5>{participant?.fullName}</h5>
                    <small>{conv?.lastMessage?.text?.slice(0, 30)}{conv?.lastMessage?.text?.length > 30 ? '...' : ''}</small>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
