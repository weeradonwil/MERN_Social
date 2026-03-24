import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import ProfileImage from './ProfileImage'
import TimeAgo from 'react-timeago'
import axios from 'axios'
import { FaRegCommentDots } from 'react-icons/fa'
import { IoMdShare } from 'react-icons/io'
import LikeDislikePost from './LikeDislikePost'
import TrimText from '../helpers/TrimText'
import { BsThreeDots } from 'react-icons/bs'

const Feed = ({ post, onDeletePost }) => {
    const [creator, setCreator] = useState({})
    const [showFeedHeaderMenu, setShowFeedHeaderMenu] = useState(false)

    const token = useSelector(state => state?.user?.currentUser?.token)
    const userId = useSelector(state => state?.user?.currentUser?.id)

    const getPostCreator = async () => {
        try {
            if (typeof post?.creator === "object") {
                setCreator(post.creator)
                return
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/users/${post?.creator}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            setCreator(response?.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (post?.creator) {
            getPostCreator()
        }
    }, [post])

    const deletePostHandler = async () => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/posts/${post?._id}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            setShowFeedHeaderMenu(false)

            if (onDeletePost) {
                onDeletePost(post?._id)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const isOwner =
        userId === (typeof post?.creator === "object" ? post?.creator?._id : post?.creator)

    return (
        <article className="feed">
            <header className="feed__header">
                <Link
                    to={`/users/${typeof post?.creator === "object" ? post?.creator?._id : post?.creator}`}
                    className="feed__header-profile"
                >
                    <ProfileImage image={creator?.profilePhoto} />
                    <div className="feed__header-details">
                        <h4>{creator?.fullName}</h4>
                        {post?.createdAt && (
                        <small>
                            <TimeAgo date={post.createdAt} /> &middot; {new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </small>
                    )}
                    </div>
                </Link>

                {isOwner && (
                    <button onClick={() => setShowFeedHeaderMenu(prev => !prev)}>
                        <BsThreeDots />
                    </button>
                )}

                {showFeedHeaderMenu && isOwner && (
                    <menu className="feed__header-menu">
                        <button type="button" onClick={deletePostHandler}>
                            Delete
                        </button>
                    </menu>
                )}
            </header>

            <Link to={`/posts/${post?._id}`} className='feed__body'>
                <p><TrimText item={post?.body} maxLength={160} /></p>
                {post?.image && (
                    <div className="feed__images">
                        <img src={post?.image} alt="" />
                    </div>
                )}
                {post?.video && (
                    <div className="feed__images">
                        <video src={post?.video} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '400px' }} />
                    </div>
                )}
            </Link>

            <footer className="feed__footer">
                <div>
                    <LikeDislikePost post={post} />
                    <button type="button" className="feed__footer-comments">
                        <Link to={`/posts/${post?._id}`}><FaRegCommentDots /></Link>
                        <small>{post?.comments?.length}</small>
                    </button>
                </div>
            </footer>
        </article>
    )
}

export default Feed