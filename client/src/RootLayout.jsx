import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Widgets } from './components/Widgets'
import { useSelector } from 'react-redux'
import ThemeModal from './components/ThemeModal'
import EditProfileModal from './components/EditProfileModal'

const RootLayout = () => {
  const { themeModalIsOpen, editProfileModalOpen } = useSelector(state => state?.ui)
  const { primaryColor, backgroundColor } = useSelector((state => state?.ui?.theme))

  useEffect(() => {
    const body = document.body
    body.className = `${primaryColor} ${backgroundColor}`
  }, [primaryColor, backgroundColor])

  return (
    <>
      <Navbar />
      <main className="main">
        <div className="container main__container">
          <Sidebar />
          <Outlet />
          <Widgets />
          {themeModalIsOpen && <ThemeModal />}
          {editProfileModalOpen && <EditProfileModal />}
        </div>
      </main>
    </>
  )
}

export default RootLayout