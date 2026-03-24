import React, { useEffect, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import ProfileImage from './ProfileImage'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Navbar = () => {
  const currentUser = useSelector(state => state?.user?.currentUser)
  const userId = currentUser?.id
  const token = currentUser?.token
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  useEffect(() => {
    if (!token) return
    const timer = setTimeout(() => {
      navigate('/logout')
    }, 1000 * 60 * 60)
    return () => clearTimeout(timer)
  }, [token, navigate])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      const filtered = res?.data?.filter(u =>
        u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setShowResults(true)
    } catch (err) {
      console.log(err)
    }
  }

  const handleInputChange = async (e) => {
    const val = e.target.value
    setQuery(val)
    if (!val.trim()) {
      setResults([])
      setShowResults(false)
      return
    }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      const filtered = res?.data?.filter(u =>
        u.fullName.toLowerCase().includes(val.toLowerCase()) ||
        u.email.toLowerCase().includes(val.toLowerCase())
      )
      setResults(filtered)
      setShowResults(true)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <nav className='navbar'>
      <div className="container navbar__container">
        <Link to="/" className='barbar__logo'>LAND</Link>

        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <form className="navbar__search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder='Search'
              value={query}
              onChange={handleInputChange}
              onFocus={() => results.length > 0 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
            <button type='submit'><CiSearch /></button>
          </form>

          {showResults && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: 'var(--color-gray-200)', borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 9999,
              maxHeight: '300px', overflowY: 'auto'
            }}>
              {results.map(user => (
                <Link
                  key={user._id}
                  to={`/users/${user._id}`}
                  onClick={() => { setShowResults(false); setQuery('') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderBottom: '1px solid var(--color-gray-300)' }}
                >
                  <img
                    src={user?.profilePhoto || "https://res.cloudinary.com/dtbqrwpbr/image/upload/v1774097734/5951752_hkdrek.png"}
                    alt={user?.fullName}
                    style={{ width: '2rem', height: '2rem', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>{user?.fullName}</p>
                    <small style={{ color: 'var(--color-light)' }}>{user?.email}</small>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {showResults && results.length === 0 && query.trim() && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: 'var(--color-gray-200)', borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 9999,
              padding: '1rem', textAlign: 'center', color: 'var(--color-light)'
            }}>
              ไม่พบผู้ใช้
            </div>
          )}
        </div>

        <div className="navbar__right">
          <Link to={`/users/${userId}`} className='navbar__profile'>
            <ProfileImage image={currentUser?.profilePhoto} />
          </Link>
          {token ? <Link to="/logout">Logout</Link> : <Link to="/login">Login</Link>}
        </div>
      </div>
    </nav>
  )
}

export default Navbar