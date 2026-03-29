import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProfileImage from '../components/ProfileImage'
import axios from 'axios'
import { useSelector } from 'react-redux'
import TimeAgo from 'react-timeago'
import LikeDislikePost from '../components/LikeDislikePost'
import { FaRegCommentDots } from 'react-icons/fa'
import { IoMdSend } from 'react-icons/io'
import PostComment from '../components/PostComment'

const SinglePost = () => {
  let { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState({})
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState("")
  const token = useSelector(state => state?.user?.currentUser?.token)

  const getPost = async () => {
    try {
      // ดึง post
      const postRes = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setPost(postRes?.data)

      // ดึง comments แบบ live (ชื่อ/รูปอัปเดตตาม profile)
      const commentRes = await axios.get(`${import.meta.env.VITE_API_URL}/comments/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setComments(commentRes?.data?.comments || [])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (token) {
      getPost()
    }
  }, [token, id])

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/comments/${commentId}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      )
      setComments(comments.filter(c => c?._id !== commentId))
    } catch (error) {
      console.log(error)
    }
  }

  const createComment = async (e) => {
    try {
      e.preventDefault()
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments/${id}`,
        { comment },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      )
      setComments([response?.data, ...comments])
      setComment("")
    } catch (error) {
      console.log(error)
    }
  }

  const creatorId = typeof post?.creator === 'object' ? post?.creator?._id : post?.creator
  const creatorPhoto = post?.creator?.profilePhoto
  const creatorName = post?.creator?.fullName

  return (
    <section className="singlePost">
      <header
        className="feed__header"
        style={{ cursor: 'pointer' }}
        onClick={() => creatorId && navigate(`/users/${creatorId}`)}
      >
        <ProfileImage image={creatorPhoto} />
        <div>
          <h4>{creatorName}</h4>
          {post?.createdAt && (
            <small>
              <TimeAgo date={post.createdAt} /> &middot; {new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </small>
          )}
        </div>
      </header>

      <div className="feed__body">
        <p>{post?.body}</p>
        {post?.image && <img src={post.image} alt="" />}
        {post?.video && (
          <video src={post.video} controls style={{ width: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />
        )}
      </div>

      <footer className="feed__footer">
        <div>
          {post?.likes && <LikeDislikePost post={post} />}
          <button className="feed__footer-comments"><FaRegCommentDots /></button>
        </div>
      </footer>

      <ul className="singlePost__comments">
        <form className="singlePost__comments-form" onSubmit={createComment}>
          <textarea
            placeholder='Enter your comment...'
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button type="submit" className='singlePost__comments-btn'><IoMdSend /></button>
        </form>

        {comments?.map(comment => (
          <PostComment key={comment?._id} comment={comment} onDeleteComment={deleteComment} />
        ))}
      </ul>
    </section>
  )
}

export default SinglePost