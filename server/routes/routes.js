const router = require("express").Router()

const {registerUser, loginUser, getUser, getUsers, editUser, followUnfollowUser, changeUserAvatar, deleteUser}
= require('../controllers/userControllers')
const {createPost, updatePost, deletePost, getPost, getPosts,
    getUserPosts, getUserBookmarks, createBookmark, likeDislikePost, getFollowingPosts} = require('../controllers/postControllers')
const {createComment, getPostComments, deleteComment} = require('../controllers/commentControllers')
const {createMessage, getMessages, getConversations, deleteConversation} = require("../controllers/messaageControllers")
const {forgotPassword, resetPassword} = require("../controllers/authControllers")
const {createGroup, getGroups, getGroup, joinLeaveGroup, deleteGroup, createGroupPost, getGroupPosts, deleteGroupPost, likeGroupPost, createGroupComment, deleteGroupComment} = require("../controllers/groupControllers")
const authMiddleware = require("../middleware/authMiddleware")

// Auth Routes (Forgot/Reset Password)
router.post('/auth/forgot-password', forgotPassword)
router.post('/auth/reset-password/:token', resetPassword)

//User Routes
router.post('/users/register', registerUser)
router.post('/users/login', loginUser)
router.get('/users/bookmarks', authMiddleware, getUserBookmarks) // brought this route up here to avoid conflict with get user
router.get('/users/:id', authMiddleware, getUser)
router.get('/users', authMiddleware, getUsers)
router.patch('/users/:id',authMiddleware, editUser)
router.get('/users/:id/follow-unfollow', authMiddleware, followUnfollowUser)
router.post('/users/avatar', authMiddleware, changeUserAvatar)
router.get('/users/:id/posts', authMiddleware, getUserPosts)



// POST ROUTES
router.post('/posts', authMiddleware, createPost)
router.get('/posts/following', authMiddleware, getFollowingPosts)
router.get('/posts/:id', authMiddleware, getPost)
router.get('/posts', authMiddleware, getPosts)
router.patch('/posts/:id', authMiddleware, updatePost)
router.delete('/posts/:id', authMiddleware, deletePost)
router.get('/posts/:id/like', authMiddleware, likeDislikePost)
router.get('/posts/:id/bookmark', authMiddleware, createBookmark)


// POST ROUTES
router.post('/comments/:postId', authMiddleware, createComment)
router.get('/comments/:postId', authMiddleware, getPostComments)
router.delete('/comments/:commentId', authMiddleware, deleteComment)


// Message Routes
router.post('/messages/:receiverId', authMiddleware, createMessage)
router.get('/messages/:receiverId', authMiddleware, getMessages)
router.get('/conversations', authMiddleware, getConversations)
router.delete('/conversations/:receiverId', authMiddleware, deleteConversation)



// Group Routes
router.post('/groups', authMiddleware, createGroup)
router.get('/groups', authMiddleware, getGroups)
router.get('/groups/:id', authMiddleware, getGroup)
router.get('/groups/:id/join', authMiddleware, joinLeaveGroup)
router.delete('/groups/:id', authMiddleware, deleteGroup)
router.post('/groups/:id/posts', authMiddleware, createGroupPost)
router.get('/groups/:id/posts', authMiddleware, getGroupPosts)
router.delete('/groups/:id/posts/:postId', authMiddleware, deleteGroupPost)
router.get('/groups/:id/posts/:postId/like', authMiddleware, likeGroupPost)
router.post('/groups/:id/posts/:postId/comments', authMiddleware, createGroupComment)
router.delete('/groups/:id/posts/:postId/comments/:commentId', authMiddleware, deleteGroupComment)



module.exports = router;