import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { MdGroups, MdAdd } from 'react-icons/md'

const Groups = () => {
    const [groups, setGroups] = useState([])
    const [showCreate, setShowCreate] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [coverPhoto, setCoverPhoto] = useState(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const token = useSelector(state => state?.user?.currentUser?.token)
    const userId = useSelector(state => state?.user?.currentUser?.id)
    const navigate = useNavigate()

    const getGroups = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            })
            setGroups(res?.data || [])
        } catch (err) { console.log(err) }
    }

    useEffect(() => { if (token) getGroups() }, [token])

    const handleCreate = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            if (coverPhoto) formData.append('coverPhoto', coverPhoto)

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/groups`, formData, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            })
            setGroups(prev => [res.data, ...prev])
            setShowCreate(false)
            setName('')
            setDescription('')
            setCoverPhoto(null)
            navigate(`/groups/${res.data._id}`)
        } catch (err) {
            setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด')
        }
        setIsLoading(false)
    }

    const handleJoinLeave = async (groupId, e) => {
        e.preventDefault()
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupId}/join`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            })
            setGroups(prev => prev.map(g => g._id === groupId ? res.data : g))
        } catch (err) { console.log(err) }
    }

    return (
        <section className="mainArea">
            <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MdGroups size={28} /> กลุ่มทั้งหมด
                    </h2>
                    <button onClick={() => setShowCreate(!showCreate)} className="btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MdAdd /> สร้างกลุ่ม
                    </button>
                </div>

                {/* Create Group Form */}
                {showCreate && (
                    <form onSubmit={handleCreate}
                        style={{ background: 'var(--color-gray-200)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>สร้างกลุ่มใหม่</h3>
                        {error && <p style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</p>}
                        <input type="text" placeholder="ชื่อกลุ่ม *" value={name}
                            onChange={e => setName(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', marginBottom: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-gray-300)' }} />
                        <textarea placeholder="คำอธิบายกลุ่ม" value={description}
                            onChange={e => setDescription(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', marginBottom: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-gray-300)', resize: 'none', height: '80px' }} />
                        <div style={{ marginBottom: '0.8rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>รูปภาพปกกลุ่ม (ไม่บังคับ)</label>
                            <input type="file" accept="image/*" onChange={e => setCoverPhoto(e.target.files[0])} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button type="submit" className="btn" disabled={isLoading}>
                                {isLoading ? 'กำลังสร้าง...' : 'สร้างกลุ่ม'}
                            </button>
                            <button type="button" onClick={() => setShowCreate(false)}
                                style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--color-gray-300)', cursor: 'pointer' }}>
                                ยกเลิก
                            </button>
                        </div>
                    </form>
                )}

                {/* Groups List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {groups.map(group => {
                        const isMember = group.members?.some(m => (m._id || m) === userId || (m._id || m).toString() === userId)
                        const isCreator = (group.creator?._id || group.creator)?.toString() === userId
                        return (
                            <div key={group._id}
                                style={{ background: 'var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-gray-300)' }}>
                                <Link to={`/groups/${group._id}`}>
                                    {group.coverPhoto ? (
                                        <img src={group.coverPhoto} alt={group.name}
                                            style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '140px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MdGroups size={60} color="white" />
                                        </div>
                                    )}
                                </Link>
                                <div style={{ padding: '1rem' }}>
                                    <Link to={`/groups/${group._id}`}>
                                        <h4 style={{ marginBottom: '0.3rem' }}>{group.name}</h4>
                                    </Link>
                                    <small style={{ color: 'var(--color-light)' }}>
                                        {group.members?.length || 0} สมาชิก
                                    </small>
                                    {group.description && (
                                        <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: 'var(--color-light)' }}>
                                            {group.description.slice(0, 60)}{group.description.length > 60 ? '...' : ''}
                                        </p>
                                    )}
                                    <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                                        <Link to={`/groups/${group._id}`} className="btn" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                                            ดูกลุ่ม
                                        </Link>
                                        {!isCreator && (
                                            <button onClick={(e) => handleJoinLeave(group._id, e)}
                                                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--color-primary)', background: isMember ? 'transparent' : 'var(--color-primary)', color: isMember ? 'var(--color-primary)' : 'white', cursor: 'pointer' }}>
                                                {isMember ? 'ออกจากกลุ่ม' : 'เข้าร่วม'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {groups.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--color-light)', marginTop: '2rem' }}>
                        ยังไม่มีกลุ่ม กดสร้างกลุ่มแรกได้เลย!
                    </p>
                )}
            </div>
        </section>
    )
}

export default Groups
