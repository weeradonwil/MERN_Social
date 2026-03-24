import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const MessagesList = () => {
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const token = useSelector(state => state?.user?.currentUser?.token)

  const getConversations = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(response?.data || [])
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (token) {
      getConversations()
    }
  }, [token])

  return (
    <section className="mainArea">
      <div className="messageList" style={{ width: '100%', padding: '1.5rem' }}>
        <h3>Messages</h3>
        {isLoading && <p>Loading...</p>}
        {!isLoading && conversations.length === 0 && (
          <p style={{ color: 'var(--color-light)', marginTop: '1rem' }}>No conversations yet.</p>
        )}
        {conversations.map(conv => {
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
                  <small>
                    {conv?.lastMessage?.text?.slice(0, 40)}
                    {conv?.lastMessage?.text?.length > 40 ? '...' : ''}
                  </small>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default MessagesList