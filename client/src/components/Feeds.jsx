import React from 'react'
import Feed from './Feed'

const Feeds = ({ posts, onDeletePost }) => {
  return (
    <div className="feeds">
      {posts?.length < 1 ? (
        <p className="center">No posts found.</p>
      ) : (
        posts?.map(post => (
          <Feed key={post._id} post={post} onDeletePost={onDeletePost} />
        ))
      )}
    </div>
  )
}

export default Feeds