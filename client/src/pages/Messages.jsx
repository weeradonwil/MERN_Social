import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { IoSend, IoArrowBack } from 'react-icons/io5'
import { SlPicture } from 'react-icons/sl'
import { IoClose } from 'react-icons/io5'
import { MdVideoCameraBack, MdDeleteOutline } from 'react-icons/md'
import { io } from 'socket.io-client'

const Messages = () => {
  const [messages, setMessages] = useState([])
  const [receiver, setReceiver] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [previewType, setPreviewType] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const socketRef = useRef(null)

  const token = useSelector(state => state?.user?.currentUser?.token)
  const loggedInUserId = useSelector(state => state?.user?.currentUser?.id)

  const { receiverId } = useParams()
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  const deleteConversation = async () => {
    if (!window.confirm('ต้องการลบประวัติการสนทนานี้ใช่ไหม?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/conversations/${receiverId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages([])
      navigate('/messages')
    } catch (err) { console.log(err) }
  }

  // ✅ SOCKET.IO แก้แล้ว — ไม่ซ้อน on และเพิ่ม receiverId ใน dependency
  useEffect(() => {
    if (!loggedInUserId) return

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      query: { userId: loggedInUserId }
    })

    socketRef.current.on('newMessage', (msg) => {
      const isCurrentConversation =
        msg?.senderId?.toString() === receiverId ||
        msg?.receiverId?.toString() === receiverId

      if (isCurrentConversation) {
        setMessages(prev => [...prev, msg])
      }
    })

    return () => socketRef.current?.disconnect()
  }, [loggedInUserId, receiverId])  // ✅ เพิ่ม receiverId

  const getReceiver = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${receiverId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setReceiver(response?.data)
    } catch (error) { console.log(error) }
  }

  const getMessages = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${receiverId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response?.data || [])
    } catch (error) {
      if (error?.response?.status !== 404) console.log(error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if ((!messageText.trim() && !imageFile) || isSending) return

    setIsSending(true)
    try {
      const formData = new FormData()
      if (messageText.trim()) formData.append('messageBody', messageText)
      if (imageFile && previewType === 'image') formData.append('image', imageFile)
      if (imageFile && previewType === 'video') formData.append('video', imageFile)

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/messages/${receiverId}`,
        formData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setMessages(prev => [...prev, response?.data])
      setMessageText('')
      setImageFile(null)
      setImagePreview(null)
      setPreviewType(null)
      const imgInput = document.getElementById('msgImage')
      const vidInput = document.getElementById('msgVideo')
      if (imgInput) imgInput.value = ''
      if (vidInput) vidInput.value = ''
    } catch (error) { console.log(error) }
    setIsSending(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setPreviewType('image')
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setPreviewType(null)
  }

  useEffect(() => {
    if (token && receiverId) {
      getReceiver()
      getMessages()
    }
  }, [token, receiverId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <section className="mainArea">
      <div className="messagesBox">
        {/* Header */}
        <div className="messagesBox__header">
          <Link to="/messages" style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <IoArrowBack size={20} />
          </Link>
          {receiver && (
            <>
              <img
                src={receiver?.profilePhoto || `https://res.cloudinary.com/dtbqrwpbr/image/upload/v1774097734/5951752_hkdrek.png`}
                alt={receiver?.fullName}
                style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h4>{receiver?.fullName}</h4>
                <small style={{ color: 'var(--color-light)' }}>{receiver?.email}</small>
              </div>
              <button onClick={deleteConversation} title="ลบประวัติการสนทนา"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: '1.4rem', display: 'flex', alignItems: 'center' }}>
                <MdDeleteOutline />
              </button>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="messagesBox__messages">
          {messages.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-light)', marginTop: '2rem' }}>
              No messages yet. Say hello! 👋
            </p>
          )}
          {messages.map(msg => {
            const isSent = msg?.senderId === loggedInUserId || msg?.senderId?._id === loggedInUserId
            return (
              <div key={msg._id} className={`messagesBox__message ${isSent ? 'sent' : ''}`}>
                {msg?.image && (
                  <img src={msg.image} alt="sent"
                    style={{ width: '100%', maxWidth: '250px', borderRadius: '8px', marginBottom: '0.4rem', display: 'block' }} />
                )}
                {msg?.video && (
                  <video src={msg.video} controls
                    style={{ width: '100%', maxWidth: '250px', borderRadius: '8px', marginBottom: '0.4rem', display: 'block' }} />
                )}
                {msg?.text && <p>{msg.text}</p>}
                <small>{formatTime(msg?.createdAt)}</small>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Preview */}
        {imagePreview && (
          <div style={{ padding: '0.5rem 1.2rem', position: 'relative', display: 'inline-block' }}>
            {previewType === 'video' ? (
              <video src={imagePreview} controls
                style={{ height: '120px', borderRadius: '8px' }} />
            ) : (
              <img src={imagePreview} alt="preview"
                style={{ height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
            )}
            <button onClick={clearImage}
              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              <IoClose />
            </button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '1.2rem', background: 'var(--color-gray-200)', position: 'sticky', bottom: 0 }}>
          <label htmlFor="msgImage" style={{ cursor: 'pointer', color: 'var(--color-primary)', fontSize: '1.4rem', display: 'flex', alignItems: 'center' }}>
            <SlPicture />
          </label>
          <input type="file" id="msgImage" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          <label htmlFor="msgVideo" style={{ cursor: 'pointer', color: 'var(--color-primary)', fontSize: '1.4rem', display: 'flex', alignItems: 'center' }}>
            <MdVideoCameraBack />
          </label>
          <input type="file" id="msgVideo" accept="video/*" onChange={e => {
            const file = e.target.files[0]
            if (!file) return
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
            setPreviewType('video')
          }} style={{ display: 'none' }} />
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            disabled={isSending}
            style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--color-gray-0)' }}
          />
          <button type="submit" disabled={isSending || (!messageText.trim() && !imageFile)}
            style={{ height: '3rem', width: '3rem', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IoSend />
          </button>
        </form>
      </div>
    </section>
  )
}

export default Messages