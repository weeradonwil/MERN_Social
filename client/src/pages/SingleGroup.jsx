import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MdGroups, MdDelete } from 'react-icons/md'
import { SlPicture } from 'react-icons/sl'
import { MdVideoCameraBack } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'
import { BsThreeDots } from 'react-icons/bs'
import TimeAgo from 'react-timeago'

const SingleGroup = () => {
    const [group, setGroup] = useState(null)
    const [posts, setPosts] = useState([])
    const [body, setBody] = useState('')
    const [image, setImage] = useState(null)
    const [video, setVideo] = useState(null)
    const [preview, setPreview] = useState(null)
    const [previewType, setPreviewType] = useState(null)
    const [error, setError] = useState('')
    const [isPosting, setIsPosting] = useState(false)
    const [activeMenu, setActiveMenu] = useState(null)
    const [activeComment, setActiveComment] = useState(null)
    const [commentInputs, setCommentInputs] = useState({})

    const token = useSelector(state => state?.user?.currentUser?.token)
    const userId = useSelector(state => state?.user?.currentUser?.id)
    const { id } = useParams()
    const navigate = useNavigate()

    const getGroup = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${id}`, {
                withCredentials: true, headers: { Authorization: `Bearer ${token}` }
            })
            setGroup(res?.data)
        } catch (err) { console.log(err) }
    }

    const getGroupPosts = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${id}/posts`, {
                withCredentials: true, headers: { Authorization: `Bearer ${token}` }
            })
            setPosts(res?.data || [])
        } catch (err) {
            if (err?.response?.status !== 403) console.log(err)
        }
    }

    useEffect(() => {
        if (token && id) { getGroup(); getGroupPosts() }
    }, [token, id])

    const isMember = group?.members?.some(m => (m._id || m)?.toString() === userId)
    const isCreator = (group?.creator?._id || group?.creator)?.toString() === userId

    const handleJoinLeave = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${id}/join`, {
                withCredentials: true, headers: { Authorization: `Bearer ${token}` }
            })
            setGroup(res?.data)
            if (!res?.data?.members?.some(m => (m._id || m)?.toString() === userId)) {
                setPosts([])
            } else {
                getGroupPosts()
            }
        } catch (err) { console.log(err) }
    }

    const handleDeleteGroup = async () => {
        if (!window.confirm('ต้องการลบกลุ่มนี้ใช่ไหม?')) return
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${id}`, {
                withCredentials: true, headers: { Authorization: `Bearer ${token}` }
            })
            navigate('/groups')
        } catch (err) { console.log(err) }
    }

    const handlePost = async (e) => {
        e.preventDefault()
        if (!body.trim()) return
        setIsPosting(true)
        setError('')
        try {
            const formData = new FormData()
            formData.append('body', body)
            if (image) formData.append('image', image)
            if (video) formData.append('video', video)
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/groups/${id}/posts`, formData, {
                withCredentials: true, headers: { Authorization: `Bearer ${token}` }
            })
            setPosts(prev => [res.data, ...prev])
            setBody(''); setImage(null); setVideo(null); setPreview(null); setPreviewType(null)
        } catch (err) {
            setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด')
        }
        setIsPosting(false)
    }

    const handleLikePost = async (postId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${id}/posts/${postId}/like`, {
                withCredentials: true, headers: { Authorization: `Bearer ${token}` }
            })
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p))
        } catch (err) { console.log(err) }
    }

    const handleCreateComment = async (e, postId) => {
        e.preventDefault()
        const comment = commentInputs[postId]
        if (!comment?.trim()) return
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/groups/${id}/posts/${postId}/comments`,
                { comment },
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
            )
            setPosts(prev => prev.map(p => p._id === postId
                ? { ...p, comments: [...(p.comments || []), res.data] }
                : p
            ))
            setCommentInputs(prev => ({ ...prev, [postId]: '' }))
        } catch (err) { console.log(err) }
    }

    const handleDeleteComment = async (postId, commentId) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/groups/${id}/posts/${postId}/comments/${commentId}`,
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
            )
            setPosts(prev => prev.map(p => p._id === postId
                ? { ...p, comments: p.comments.filter(c => c._id !== commentId) }
                : p
            ))
        } catch (err) { console.log(err) }
    }

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${id}/posts/${postId}`, {
                withCredentials: true, headers: { Authorization: `Bearer ${token}` }
            })
            setPosts(prev => prev.filter(p => p._id !== postId))
            setActiveMenu(null)
        } catch (err) { console.log(err) }
    }

    const handleMediaChange = (file, type) => {
        if (type === 'image') { setImage(file); setVideo(null) }
        else { setVideo(file); setImage(null) }
        setPreview(URL.createObjectURL(file))
        setPreviewType(type)
    }

    if (!group) return <section className="mainArea"><p style={{ padding: '2rem' }}>Loading...</p></section>

    return (
        <section className="mainArea">
            {/* Cover */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                {group.coverPhoto ? (
                    <img src={group.coverPhoto} alt={group.name}
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                ) : (
                    <div style={{ width: '100%', height: '200px', background: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MdGroups size={80} color="white" />
                    </div>
                )}
            </div>

            {/* Group Info */}
            <div style={{ padding: '0 0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2>{group.name}</h2>
                    <small style={{ color: 'var(--color-light)' }}>{group.members?.length} สมาชิก</small>
                    {group.description && <p style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>{group.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!isCreator && (
                        <button onClick={handleJoinLeave}
                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-primary)', background: isMember ? 'transparent' : 'var(--color-primary)', color: isMember ? 'var(--color-primary)' : 'white', cursor: 'pointer' }}>
                            {isMember ? 'ออกจากกลุ่ม' : 'เข้าร่วมกลุ่ม'}
                        </button>
                    )}
                    {isCreator && (
                        <button onClick={handleDeleteGroup}
                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#e53e3e', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MdDelete /> ลบกลุ่ม
                        </button>
                    )}
                </div>
            </div>

            {/* Create Post (members only) */}
            {isMember && (
                <form onSubmit={handlePost}
                    style={{ background: 'var(--color-gray-200)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
                    {error && <p style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</p>}
                    <textarea placeholder="เขียนอะไรในกลุ่ม..." value={body}
                        onChange={e => setBody(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', resize: 'none', height: '80px', background: 'var(--color-gray-0)' }} />

                    {preview && (
                        <div style={{ position: 'relative', margin: '0.5rem 0', display: 'inline-block' }}>
                            {previewType === 'image'
                                ? <img src={preview} alt="preview" style={{ maxHeight: '200px', borderRadius: '8px' }} />
                                : <video src={preview} controls style={{ maxHeight: '200px', borderRadius: '8px' }} />
                            }
                            <button type="button" onClick={() => { setImage(null); setVideo(null); setPreview(null); setPreviewType(null) }}
                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IoClose size={14} />
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
                        <div style={{ display: 'flex', gap: '0.8rem', fontSize: '1.3rem', color: 'var(--color-primary)' }}>
                            <label htmlFor="gpImage" style={{ cursor: 'pointer' }} title="รูปภาพ"><SlPicture /></label>
                            <input type="file" id="gpImage" accept="image/*" style={{ display: 'none' }} onChange={e => handleMediaChange(e.target.files[0], 'image')} />
                            <label htmlFor="gpVideo" style={{ cursor: 'pointer' }} title="วิดีโอ"><MdVideoCameraBack /></label>
                            <input type="file" id="gpVideo" accept="video/*" style={{ display: 'none' }} onChange={e => handleMediaChange(e.target.files[0], 'video')} />
                        </div>
                        <button type="submit" className="btn" disabled={isPosting || !body.trim()}>
                            {isPosting ? 'กำลังโพสต์...' : 'โพสต์'}
                        </button>
                    </div>
                </form>
            )}

            {/* Posts */}
            {!isMember && !isCreator && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-light)' }}>
                    <MdGroups size={50} />
                    <p style={{ marginTop: '1rem' }}>เข้าร่วมกลุ่มเพื่อดูโพสต์ทั้งหมด</p>
                </div>
            )}

            {(isMember || isCreator) && posts.map(post => (
                <article key={post._id} className="feed" style={{ marginBottom: '1rem' }}>
                    <header className="feed__header">
                        <Link to={`/users/${post.creator?._id}`} className="feed__header-profile">
                            <img src={post.creator?.profilePhoto} alt={post.creator?.fullName}
                                style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                            <div className="feed__header-details">
                                <h4>{post.creator?.fullName}</h4>
                                <small>
                                    <TimeAgo date={post.createdAt} /> &middot; {new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </small>
                            </div>
                        </Link>
                        {(post.creator?._id === userId || isCreator) && (
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setActiveMenu(activeMenu === post._id ? null : post._id)}>
                                    <BsThreeDots />
                                </button>
                                {activeMenu === post._id && (
                                    <menu className="feed__header-menu">
                                        <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                                    </menu>
                                )}
                            </div>
                        )}
                    </header>
                    <div className="feed__body">
                        <p>{post.body}</p>
                        {post.image && <div className="feed__images"><img src={post.image} alt="" /></div>}
                        {post.video && <div className="feed__images"><video src={post.video} controls style={{ width: '100%', borderRadius: '8px' }} /></div>}
                    </div>

                    {/* Like + Comment count */}
                    <footer className="feed__footer">
                        <div>
                            <button className="feed__footer-comments" onClick={() => handleLikePost(post._id)}>
                                {post.likes?.includes(userId) ? '❤️' : '🤍'}
                                <small>{post.likes?.length || 0}</small>
                            </button>
                            <button className="feed__footer-comments" onClick={() => setActiveComment(activeComment === post._id ? null : post._id)}>
                                💬 <small>{post.comments?.length || 0}</small>
                            </button>
                        </div>
                    </footer>

                    {/* Comment Section */}
                    {activeComment === post._id && (
                        <div style={{ padding: '0.8rem 1.2rem', borderTop: '1px solid var(--color-gray-300)' }}>
                            <form onSubmit={(e) => handleCreateComment(e, post._id)}
                                style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                <input type="text" placeholder="เขียนคอมเมนต์..."
                                    value={commentInputs[post._id] || ''}
                                    onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                    style={{ flex: 1, padding: '0.5rem 0.8rem', borderRadius: '20px', border: '1px solid var(--color-gray-300)', background: 'var(--color-gray-0)' }} />
                                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                                    ส่ง
                                </button>
                            </form>
                            {post.comments?.map(c => (
                                <div key={c._id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                                    <img src={c.creator?.creatorPhoto || "https://res.cloudinary.com/dtbqrwpbr/image/upload/v1774097734/5951752_hkdrek.png"}
                                        alt="" style={{ width: '1.8rem', height: '1.8rem', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                    <div style={{ background: 'var(--color-gray-200)', borderRadius: '12px', padding: '0.4rem 0.8rem', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h5 style={{ fontSize: '0.85rem' }}>{c.creator?.creatorName}</h5>
                                            {(c.creator?.creatorId === userId || isCreator) && (
                                                <button onClick={() => handleDeleteComment(post._id, c._id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-light)', fontSize: '0.75rem' }}>ลบ</button>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.9rem' }}>{c.comment}</p>
                                        <small style={{ color: 'var(--color-light)', fontSize: '0.75rem' }}><TimeAgo date={c.createdAt} /></small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            ))}

            {(isMember || isCreator) && posts.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--color-light)', marginTop: '2rem' }}>
                    ยังไม่มีโพสต์ในกลุ่มนี้
                </p>
            )}
        </section>
    )
}

export default SingleGroup
