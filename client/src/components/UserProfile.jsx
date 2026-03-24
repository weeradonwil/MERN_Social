import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { LuUpload } from 'react-icons/lu'
import { FaCheck } from 'react-icons/fa'
import { userActions } from '../store/user-slice'
import { uiSliceActions } from '../store/ui-slice'

const DEFAULT_AVATAR = "https://res.cloudinary.com/dtbqrwpbr/image/upload/v1774097734/5951752_hkdrek.png"

const UserProfile = ({ totalLikes = 0 }) => {
  const token = useSelector(state => state?.user?.currentUser?.token)
  const loggedInUserId = useSelector(state => state?.user?.currentUser?.id)
  const currentUser = useSelector(state => state?.user?.currentUser)

  const [user, setUser] = useState({})
  const [followsUser, setFollowsUser] = useState(false)
  const [avatar, setAvatar] = useState("")

  const dispatch = useDispatch()
  const { id: userId } = useParams()

  const hasNewAvatar = avatar instanceof File

  const getUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setUser(response?.data)
      setFollowsUser(response?.data?.followers?.includes(loggedInUserId) || false)
      setAvatar(response?.data?.profilePhoto || "")
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (token && userId) {
      getUser()
    }
  }, [token, userId])

  const changeAvatarHandler = async (e) => {
    e.preventDefault()

    if (!hasNewAvatar) return

    try {
      const postData = new FormData()
      postData.append("avatar", avatar)

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/avatar`,
        postData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const updatedUser = response?.data

      dispatch(
        userActions.ChangeCurrentUser({
          ...currentUser,
          ...updatedUser
        })
      )

      setUser(updatedUser)
      setAvatar(updatedUser?.profilePhoto || "")
    } catch (error) {
      console.log(error)
    }
  }

  const openEditProfileModal = () => {
    dispatch(uiSliceActions.openEditProfileModal())
  }




  const followUnfollowUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${userId}/follow-unfollow`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const updatedUser = response?.data

      setUser(updatedUser)

      setFollowsUser(
        updatedUser?.followers?.includes(loggedInUserId)
      )

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <section className='profile'>
      <div className='profile__container'>
        <form
          className='profile__image'
          onSubmit={changeAvatarHandler}
          encType='multipart/form-data'
        >
          <img
            src={hasNewAvatar ? URL.createObjectURL(avatar) : (user?.profilePhoto || DEFAULT_AVATAR)}
            alt=""
            onError={e => { e.target.src = DEFAULT_AVATAR }}
          />

          {!hasNewAvatar ? (
            <label htmlFor="avatar" className='profile__image-edit'>
              <span><LuUpload /></span>
            </label>
          ) : (
            <button type='submit' className="profile__image-btn">
              <FaCheck />
            </button>
          )}

          <input
            type="file"
            name="avatar"
            id="avatar"
            onChange={async e => {
              const file = e.target.files[0]
              if (!file) return

              setAvatar(file)

              const postData = new FormData()
              postData.append("avatar", file)

              try {
                const response = await axios.post(
                  `${import.meta.env.VITE_API_URL}/users/avatar`,
                  postData,
                  {
                    withCredentials: true,
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  }
                )

                const updatedUser = response?.data

                dispatch(
                  userActions.ChangeCurrentUser({
                    ...currentUser,
                    ...updatedUser
                  })
                )

                setUser(updatedUser)
                setAvatar(updatedUser?.profilePhoto || "")
              } catch (error) {
                console.log(error)
              }
            }}
            accept="image/png, image/jpeg, image/jpg"
          />
        </form>

        <h4>{user?.fullName}</h4>
        <small>{user?.email}</small>

        <ul className="profile__follows">
          <li>
            <h4>{user?.following?.length || 0}</h4>
            <small>Following</small>
          </li>

          <li>
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
            <button className='btn' onClick={openEditProfileModal}>
              Edit Profile
            </button>
          ) : (
            <button onClick={followUnfollowUser} className='btn dark'>
              {followsUser ? "Unfollow" : "Follow"}
            </button>
          )}

          {user?._id != loggedInUserId && (
            <Link to={`/messages/${user?._id}`} className='btn default'>
              Message
            </Link>
          )}
        </div>

        <article className="profile__bio">
          <p>{user?.bio}</p>
        </article>
      </div>
    </section>
  )
}

export default UserProfile