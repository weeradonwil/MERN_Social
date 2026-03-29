const HttpError = require("../models/errorModel")
const CommentModel = require('../models/commentModel')
const PostModel = require('../models/postModel')
const UserModel = require('../models/userModel')

//===== CREATE COMMENT =====
const createComment = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        if (!comment) return next(new HttpError("Please write a comment", 422))

        const commentCreator = await UserModel.findById(req.user.id).select("fullName profilePhoto")

        const newComment = await CommentModel.create({
            creator: {
                creatorId: req.user.id,
                creatorName: commentCreator?.fullName || "",
                creatorPhoto: commentCreator?.profilePhoto || ""
            }, comment, postId
        })
        await PostModel.findByIdAndUpdate(postId, { $push: { comments: newComment?._id } }, { new: true })

        // ส่ง comment พร้อม live user data กลับไป
        res.json({
            ...newComment.toObject(),
            creator: {
                creatorId: req.user.id,
                creatorName: commentCreator?.fullName || "",
                creatorPhoto: commentCreator?.profilePhoto || ""
            }
        })
    } catch (error) {
        return next(new HttpError(error.message || "Server Error", 500))
    }
}

//===== GET POST COMMENTS =====
const getPostComments = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const post = await PostModel.findById(postId).populate({
            path: "comments",
            options: { sort: { createdAt: -1 } }
        })

        if (!post) return next(new HttpError("ไม่พบโพสต์", 404))

        const commentsWithLiveUser = await Promise.all(
            post.comments.map(async (comment) => {
                const user = await UserModel.findById(comment.creator.creatorId).select("fullName profilePhoto")
                return {
                    ...comment.toObject(),
                    creator: {
                        creatorId: comment.creator.creatorId,
                        creatorName: user?.fullName || comment.creator.creatorName,
                        creatorPhoto: user?.profilePhoto || comment.creator.creatorPhoto
                    }
                }
            })
        )

        res.json({ ...post.toObject(), comments: commentsWithLiveUser })
    } catch (error) {
        return next(new HttpError(error.message || "Server Error", 500))
    }
}

//===== DELETE COMMENT =====
const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const comment = await CommentModel.findById(commentId);
        const commentCreator = await UserModel.findById(comment?.creator?.creatorId)
        if (commentCreator?._id != req.user.id) return next(new HttpError("Unauthorized action.", 403))
        await PostModel.findByIdAndUpdate(comment?.postId, { $pull: { comments: commentId } })
        const deletedComment = await CommentModel.findByIdAndDelete(commentId)
        res.json(deletedComment)
    } catch (error) {
        return next(new HttpError(error.message || "Server Error", 500))
    }
}

module.exports = { createComment, getPostComments, deleteComment }