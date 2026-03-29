import React, { useState } from 'react'
import ProfileImage from './ProfileImage'
import { useSelector } from 'react-redux'
import { SlPicture } from 'react-icons/sl'
import { MdVideoCameraBack } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'

const CreatePost = ({ onCreatePost, error }) => {
    const [body, setBody] = useState("")
    const [image, setImage] = useState("")
    const [video, setVideo] = useState("")
    const [preview, setPreview] = useState(null)
    const [previewType, setPreviewType] = useState(null)
    const profilePhoto = useSelector(state => state?.user?.currentUser?.profilePhoto)

    const createPost = (e) => {
        e.preventDefault();
        const postData = new FormData();
        postData.set('body', body);
        if (image) postData.set('image', image);
        if (video) postData.set('video', video);
        onCreatePost(postData);
        setBody("")
        setImage("")
        setVideo("")
        setPreview(null)
        setPreviewType(null)
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImage(file)
        setVideo("")
        setPreview(URL.createObjectURL(file))
        setPreviewType('image')
    }

    const handleVideoChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setVideo(file)
        setImage("")
        setPreview(URL.createObjectURL(file))
        setPreviewType('video')
    }

    const clearMedia = () => {
        setImage("")
        setVideo("")
        setPreview(null)
        setPreviewType(null)
    }

    return (
        <form className="createPost" encType="multipart/form-data" onSubmit={createPost}>
            {error && <p className="createPost__error-message">{error}</p>}
            <div className="createPost__top">
                <ProfileImage image={profilePhoto} />
                <textarea value={body} onChange={(e => setBody(e.target.value))} placeholder="What's on your mind?"></textarea>
            </div>

            {/* Preview รูปหรือวิดีโอ */}
            {preview && (
                <div style={{ position: 'relative', margin: '0.5rem 0' }}>
                    {previewType === 'image' ? (
                        <img src={preview} alt="preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                        <video src={preview} controls style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                    )}
                    <button type="button" onClick={clearMedia}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IoClose />
                    </button>
                </div>
            )}

            <div className="createPost__bottom">
                <span></span>
                <div className="createPost__actions">
                    {/* อัปโหลดรูป */}
                    <label htmlFor="image" title="อัปโหลดรูปภาพ" style={{ cursor: 'pointer' }}><SlPicture /></label>
                    <input type="file" id='image' accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

                    {/* อัปโหลดวิดีโอ */}
                    <label htmlFor="video" title="อัปโหลดวิดีโอ" style={{ cursor: 'pointer' }}><MdVideoCameraBack /></label>
                    <input type="file" id='video' accept="video/*" onChange={handleVideoChange} style={{ display: 'none' }} />

                    <button type="submit">Post</button>
                </div>
            </div>
        </form>
    )
}

export default CreatePost