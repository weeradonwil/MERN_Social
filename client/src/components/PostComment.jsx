import React from 'react'
import { useSelector } from 'react-redux'
import TimeAgo from 'react-timeago'
import { FaRegTrashAlt } from 'react-icons/fa'

const PostComment = ({ comment, onDeleteComment }) => {
  const userId = useSelector(state => state?.user?.currentUser?.id)

  const deleteComment = () => {
    onDeleteComment(comment?._id)
  }

  return (
    <li className="singlePost__comment">
      <div className="singlePost__comment-wrapper">
        <div className="singlePost__comment-author">
          <img src={comment?.creator?.creatorPhoto} alt="" />
        </div>

        <div className="singlePost__comment-body">
          <div>
            <h5>{comment?.creator?.creatorName}</h5>
            {comment?.createdAt && (
              <small>
                <TimeAgo date={comment.createdAt} /> &middot; {new Date(comment.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </small>
            )}
          </div>

          <p>{comment?.comment}</p>
        </div>
      </div>

      {userId == comment?.creator?.creatorId && (
        <button
          className="singlePost__comment-delete-btn"
          onClick={deleteComment}
        >
          <FaRegTrashAlt />
        </button>
      )}
    </li>
  )
}

export default PostComment