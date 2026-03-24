import React from 'react'

const DEFAULT_AVATAR = "https://res.cloudinary.com/dtbqrwpbr/image/upload/v1774097734/5951752_hkdrek.png"

const ProfileImage = ({ image }) => {
  return (
    <img
      src={image || DEFAULT_AVATAR}
      alt="profile"
      className="profileImage"
      onError={e => { e.target.src = DEFAULT_AVATAR }}
    />
  )
}

export default ProfileImage