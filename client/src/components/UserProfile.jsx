import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { LuUpload } from 'react-icons/lu'
import { IoClose } from 'react-icons/io5'
import { userActions } from '../store/user-slice'
import { uiSliceActions } from '../store/ui-slice'

const DEFAULT_AVATAR = "https://res.cloudinary.com/dtbqrwpbr/image/upload/v1774097734/5951752_hkdrek.png"
const MAX_SIZE_BYTES = 500000

const UserProfile = ({ totalLikes = 0 }) => {
  const token = useSelector(state => state?.user?.currentUser?.token)
  const loggedInUserId = useSelector(state => state?.user?.currentUser?.id)
  const currentUser = useSelector(state => state?.user?.currentUser)

  const [user, setUser] = useState({})
  const [followsUser, setFollowsUser] = useState(false)
  const [avatar, setAvatar] = useState("")
  const [avatarError, setAvatarError] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [modalUsers, setModalUsers] = useState([])

  const dispatch = useDispatch()
  const { id: userId } = useParams()

  const hasNewAvatar = avatar instanceof File

  const getUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      )
      setUser(response?.data)
      setFollowsUser(response?.data?.followers?.includes(loggedInUserId) || false)
      setAvatar(response?.data?.profilePhoto || "")
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (token && userId) getUser()
  }, [token, userId])

  const openEditProfileModal = () => {
    dispatch(uiSliceActions.openEditProfileModal())
  }

  const followUnfollowUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${userId}/follow-unfollow`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      )
      const updatedUser = response?.data
      setUser(updatedUser)
      setFollowsUser(updatedUser?.followers?.includes(loggedInUserId))
    } catch (error) {
      console.log(error)
    }
  }

  const openModal = async (type) => {
    setModalType(type)
    setShowModal(true)
    const ids = type === 'following' ? user?.following : user?.followers
    if (!ids || ids.length === 0) { setModalUsers([]); return }
    try {
      const results = await Promise.all(
        ids.map(id =>
          axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      )
      setModalUsers(results.map(r => r.data))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <section className='profile'>
      <div className='profile__container'>
        <form className='profile__image' encType='multipart/form-data'>
          <img
            src={hasNewAvatar ? URL.createObjectURL(avatar) : (user?.profilePhoto || DEFAULT_AVATAR)}
            alt=""
            onError={e => { e.target.src = DEFAULT_AVATAR }}
          />
          <label htmlFor="avatar" className='profile__image-edit'>
            <span><LuUpload /></span>
          </label>
          <input
            type="file"
            name="avatar"
            id="avatar"
            onChange={async e => {
              const file = e.target.files[0]
              if (!file) return
              if (file.size > MAX_SIZE_BYTES) {
                setAvatarError("รูปโปรไฟล์ใหญ่เกินไป ควรมีขนาดเล็กกว่า 500KB")
                e.target.value = ""
                return
              }
              setAvatarError("")
              setAvatar(file)
              try {
                const postData = new FormData()
                postData.append("avatar", file)
                const response = await axios.post(
                  `${import.meta.env.VITE_API_URL}/users/avatar`,
                  postData,
                  { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
                )
                const updatedUser = response?.data
                dispatch(userActions.ChangeCurrentUser({ ...currentUser, ...updatedUser }))
                setUser(updatedUser)
                setAvatar(updatedUser?.profilePhoto || "")
              } catch (error) {
                setAvatarError(error?.response?.data?.message || "อัปโหลดรูปไม่สำเร็จ")
                setAvatar(user?.profilePhoto || "")
              }
            }}
            accept="image/png, image/jpeg, image/jpg"
          />
        </form>

        {avatarError && (
          <p style={{ color: '#e84393', fontSize: '13px', marginTop: '0.4rem', textAlign: 'center' }}>
            {avatarError}
          </p>
        )}

        <h4>{user?.fullName}</h4>
        <small>{user?.email}</small>

        <ul className="profile__follows">
          <li onClick={() => openModal('following')} style={{ cursor: 'pointer' }}>
            <h4>{user?.following?.length || 0}</h4>
            <small>Following</small>
          </li>
          <li onClick={() => openModal('followers')} style={{ cursor: 'pointer' }}>
            <h4>{user?.followers?.length || 0}</h4>
            <small>Followers</small>
          </li>
          <li>
            <h4>{totalLikes}</h4>
            <small>Likes</small>
          </li>
        </ul>

        <div className="profile__actions-wrapper">
          {user?._id == loggedInUserId ? (
            <button className='btn' onClick={openEditProfileModal}>Edit Profile</button>
          ) : (
            <button onClick={followUnfollowUser} className='btn dark'>
              {followsUser ? "Unfollow" : "Follow"}
            </button>
          )}
          {user?._id != loggedInUserId && (
            <Link to={`/messages/${user?._id}`} className='btn default'>Message</Link>
          )}
        </div>

        <article className="profile__bio">
          <p>{user?.bio}</p>
        </article>
      </div>

      {/* Modal Following/Followers */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--color-gray-200)', borderRadius: '12px',
            padding: '1.5rem', width: '100%', maxWidth: '400px',
            maxHeight: '70vh', overflowY: 'auto', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{modalType === 'following' ? 'Following' : 'Followers'}</h3>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--color-light)' }}>
                <IoClose />
              </button>
            </div>

            {modalUsers.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-light)' }}>ไม่มีรายชื่อ</p>
            ) : (
              modalUsers.map(u => (
                <div key={u._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.6rem 0', borderBottom: '1px solid var(--color-gray-300)'
                }}>
                  <Link to={`/users/${u._id}`} onClick={() => setShowModal(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
                    <img
                      src={u?.profilePhoto || DEFAULT_AVATAR}
                      alt={u?.fullName}
                      onError={e => { e.target.src = DEFAULT_AVATAR }}
                      style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <p style={{ fontWeight: '600', margin: 0 }}>{u?.fullName}</p>
                      <small style={{ color: 'var(--color-light)' }}>{u?.email}</small>
                    </div>
                  </Link>
                  {u._id !== loggedInUserId && (
                    <Link to={`/messages/${u._id}`} onClick={() => setShowModal(false)}
                      className='btn default' style={{ fontSize: '12px', padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
                      Message
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default UserProfile