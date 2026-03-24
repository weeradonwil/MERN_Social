import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { uiSliceActions } from '../store/ui-slice'
import { userActions } from '../store/user-slice'
import { IoClose } from 'react-icons/io5'

const EditProfileModal = () => {
    const dispatch = useDispatch()
    const token = useSelector(state => state?.user?.currentUser?.token)
    const currentUser = useSelector(state => state?.user?.currentUser)

    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState('')

    // ดึงข้อมูล user ปัจจุบันก่อน
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/users/${currentUser?.id}`,
                    { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
                )
                setFullName(res?.data?.fullName || '')
                setBio(res?.data?.bio || '')
            } catch (err) {
                console.log(err)
            }
        }
        if (token && currentUser?.id) fetchUser()
    }, [token, currentUser?.id])

    const closeModal = () => {
        dispatch(uiSliceActions.closeEditProfileModal())
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!fullName.trim()) {
            setError('กรุณากรอกชื่อ')
            return
        }

        setIsLoading(true)
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/users/${currentUser?.id}`,
                { fullName, bio },
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
            )
            dispatch(userActions.ChangeCurrentUser({
                ...currentUser,
                fullName: response?.data?.fullName,
                bio: response?.data?.bio
            }))
            setSuccess('แก้ไขโปรไฟล์สำเร็จ!')
            setTimeout(() => closeModal(), 1200)
        } catch (err) {
            setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด')
        }
        setIsLoading(false)
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={closeModal}>
            <div style={{
                background: 'var(--color-gray-200)', borderRadius: '16px',
                padding: '2rem', width: '100%', maxWidth: '480px', position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>แก้ไขโปรไฟล์</h3>
                    <button onClick={closeModal}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--color-gray-900)' }}>
                        <IoClose />
                    </button>
                </div>

                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                {success && <p style={{ color: 'green', marginBottom: '1rem' }}>{success}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500' }}>ชื่อ</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="ชื่อของคุณ"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-gray-300)', background: 'var(--color-gray-0)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500' }}>Bio</label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="เขียนอะไรเกี่ยวกับตัวคุณ..."
                            rows={4}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-gray-300)', background: 'var(--color-gray-0)', resize: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={closeModal}
                            style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', border: '1px solid var(--color-gray-300)', cursor: 'pointer', background: 'transparent' }}>
                            ยกเลิก
                        </button>
                        <button type="submit" disabled={isLoading}
                            style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                            {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProfileModal
