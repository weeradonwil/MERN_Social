import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import UserProfile from '../components/UserProfile'
import Feeds from '../components/Feeds'

const Profile = () => {
  const [user, setUser] = useState({})
  const [posts, setPosts] = useState([])
  const [totalLikes, setTotalLikes] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const { id: userId } = useParams()
  const token = useSelector(state => state?.user?.currentUser?.token)

  const getUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      )
      setUser(response?.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getUserPosts = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${userId}/posts`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      )
      const userPosts = response?.data?.posts || []
      setPosts(userPosts)
      // คำนวณ likes ทั้งหมด
      const likes = userPosts.reduce((sum, post) => sum + (post?.likes?.length || 0), 0)
      setTotalLikes(likes)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const deletePostFromState = (postId) => {
    setPosts(prev => {
      const updated = prev.filter(post => post._id !== postId)
      const likes = updated.reduce((sum, post) => sum + (post?.likes?.length || 0), 0)
      setTotalLikes(likes)
      return updated
    })
  }

  useEffect(() => {
    if (token && userId) {
      getUser()
      getUserPosts()
    }
  }, [token, userId])

  return (
    <section className="mainArea">
      <UserProfile totalLikes={totalLikes} />

      <div className="headerInfo">
        <h3>{user?.fullName ? `${user.fullName}'s posts` : "User's posts"}</h3>
      </div>

      {isLoading ? (
        <p className="center">Loading posts...</p>
      ) : posts?.length < 1 ? (
        <p className="center">No posts found.</p>
      ) : (
        <Feeds posts={posts} onDeletePost={deletePostFromState} />
      )}
    </section>
  )
}

export default Profile