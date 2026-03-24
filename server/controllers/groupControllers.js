const HttpError = require("../models/errorModel")
const GroupModel = require("../models/GroupModel")
const GroupPostModel = require("../models/GroupPostModel")
const cloudinary = require("../utils/cloudinary")
const path = require("path")
const { v4: uuid } = require("uuid")

// ====================== CREATE GROUP
// POST: api/groups
// PROTECTED
const createGroup = async (req, res, next) => {
    try {
        const { name, description } = req.body
        if (!name) return next(new HttpError("กรุณากรอกชื่อกลุ่ม", 422))

        let coverPhoto = ""
        if (req.files && req.files.coverPhoto) {
            const { coverPhoto: cover } = req.files
            if (cover.size > 5000000) return next(new HttpError("รูปภาพใหญ่เกินไป", 422))
            const fileName = cover.name.split(".")
            const newFileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1]
            await cover.mv(path.join(__dirname, "..", "uploads", newFileName))
            const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFileName), { resource_type: "image" })
            if (result.secure_url) coverPhoto = result.secure_url
        }

        const group = await GroupModel.create({
            name,
            description: description || "",
            coverPhoto,
            creator: req.user.id,
            members: [req.user.id]
        })
        res.status(201).json(group)
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== GET ALL GROUPS
// GET: api/groups
// PROTECTED
const getGroups = async (req, res, next) => {
    try {
        const groups = await GroupModel.find().sort({ createdAt: -1 })
            .populate("creator", "fullName profilePhoto")
        res.json(groups)
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== GET SINGLE GROUP
// GET: api/groups/:id
// PROTECTED
const getGroup = async (req, res, next) => {
    try {
        const group = await GroupModel.findById(req.params.id)
            .populate("creator", "fullName profilePhoto")
            .populate("members", "fullName profilePhoto")
        if (!group) return next(new HttpError("ไม่พบกลุ่ม", 404))
        res.json(group)
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== JOIN / LEAVE GROUP
// GET: api/groups/:id/join
// PROTECTED
const joinLeaveGroup = async (req, res, next) => {
    try {
        const group = await GroupModel.findById(req.params.id)
        if (!group) return next(new HttpError("ไม่พบกลุ่ม", 404))

        const isMember = group.members.includes(req.user.id)
        if (isMember) {
            // ออกจากกลุ่ม (ยกเว้น creator)
            if (group.creator.toString() === req.user.id.toString()) {
                return next(new HttpError("ผู้สร้างกลุ่มไม่สามารถออกจากกลุ่มได้", 422))
            }
            group.members = group.members.filter(m => m.toString() !== req.user.id.toString())
        } else {
            group.members.push(req.user.id)
        }
        await group.save()
        res.json(group)
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== DELETE GROUP
// DELETE: api/groups/:id
// PROTECTED
const deleteGroup = async (req, res, next) => {
    try {
        const group = await GroupModel.findById(req.params.id)
        if (!group) return next(new HttpError("ไม่พบกลุ่ม", 404))
        if (group.creator.toString() !== req.user.id.toString()) {
            return next(new HttpError("คุณไม่มีสิทธิ์ลบกลุ่มนี้", 403))
        }
        await GroupPostModel.deleteMany({ group: group._id })
        await GroupModel.findByIdAndDelete(req.params.id)
        res.json({ message: "ลบกลุ่มสำเร็จ" })
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== CREATE GROUP POST
// POST: api/groups/:id/posts
// PROTECTED (members only)
const createGroupPost = async (req, res, next) => {
    try {
        const group = await GroupModel.findById(req.params.id)
        if (!group) return next(new HttpError("ไม่พบกลุ่ม", 404))

        const isMember = group.members.some(m => m.toString() === req.user.id.toString())
        if (!isMember) return next(new HttpError("เฉพาะสมาชิกกลุ่มเท่านั้นที่โพสต์ได้", 403))

        const { body } = req.body
        if (!body) return next(new HttpError("กรุณากรอกข้อความ", 422))

        let imageUrl = null, videoUrl = null

        if (req.files && req.files.image) {
            const { image } = req.files
            const fileName = image.name.split(".")
            const newFileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1]
            await image.mv(path.join(__dirname, "..", "uploads", newFileName))
            const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFileName), { resource_type: "image" })
            if (result.secure_url) imageUrl = result.secure_url
        }

        if (req.files && req.files.video) {
            const { video } = req.files
            const fileName = video.name.split(".")
            const newFileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1]
            await video.mv(path.join(__dirname, "..", "uploads", newFileName))
            const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFileName), { resource_type: "video" })
            if (result.secure_url) videoUrl = result.secure_url
        }

        const post = await GroupPostModel.create({
            group: group._id,
            creator: req.user.id,
            body,
            image: imageUrl,
            video: videoUrl
        })
        group.posts.push(post._id)
        await group.save()

        const populated = await post.populate("creator", "fullName profilePhoto")
        res.status(201).json(populated)
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== GET GROUP POSTS
// GET: api/groups/:id/posts
// PROTECTED
const getGroupPosts = async (req, res, next) => {
    try {
        const group = await GroupModel.findById(req.params.id)
        if (!group) return next(new HttpError("ไม่พบกลุ่ม", 404))

        const isMember = group.members.some(m => m.toString() === req.user.id.toString())
        if (!isMember) return next(new HttpError("เฉพาะสมาชิกกลุ่มเท่านั้นที่ดูโพสต์ได้", 403))

        const posts = await GroupPostModel.find({ group: req.params.id })
            .populate("creator", "fullName profilePhoto")
            .sort({ createdAt: -1 })
        res.json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== DELETE GROUP POST
// DELETE: api/groups/:groupId/posts/:postId
// PROTECTED
const deleteGroupPost = async (req, res, next) => {
    try {
        const post = await GroupPostModel.findById(req.params.postId)
        if (!post) return next(new HttpError("ไม่พบโพสต์", 404))

        const group = await GroupModel.findById(req.params.id)
        const isCreator = post.creator.toString() === req.user.id.toString()
        const isGroupOwner = group?.creator.toString() === req.user.id.toString()

        if (!isCreator && !isGroupOwner) {
            return next(new HttpError("คุณไม่มีสิทธิ์ลบโพสต์นี้", 403))
        }

        await GroupPostModel.findByIdAndDelete(req.params.postId)
        await GroupModel.findByIdAndUpdate(req.params.id, { $pull: { posts: post._id } })
        res.json({ message: "ลบโพสต์สำเร็จ" })
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== LIKE/UNLIKE GROUP POST
// GET: api/groups/:id/posts/:postId/like
// PROTECTED
const likeGroupPost = async (req, res, next) => {
    try {
        const post = await GroupPostModel.findById(req.params.postId)
        if (!post) return next(new HttpError("ไม่พบโพสต์", 404))

        const isLiked = post.likes.includes(req.user.id)
        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString())
        } else {
            post.likes.push(req.user.id)
        }
        await post.save()
        const populated = await post.populate("creator", "fullName profilePhoto")
        res.json(populated)
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== CREATE GROUP POST COMMENT
// POST: api/groups/:id/posts/:postId/comments
// PROTECTED
const createGroupComment = async (req, res, next) => {
    try {
        const { comment } = req.body
        if (!comment) return next(new HttpError("กรุณากรอกคอมเมนต์", 422))

        const group = await GroupModel.findById(req.params.id)
        if (!group) return next(new HttpError("ไม่พบกลุ่ม", 404))

        const isMember = group.members.some(m => m.toString() === req.user.id.toString())
        if (!isMember) return next(new HttpError("เฉพาะสมาชิกกลุ่มเท่านั้น", 403))

        const UserModel = require("../models/userModel")
        const user = await UserModel.findById(req.user.id).select("fullName profilePhoto")

        const post = await GroupPostModel.findById(req.params.postId)
        if (!post) return next(new HttpError("ไม่พบโพสต์", 404))

        const newComment = {
            creator: {
                creatorId: req.user.id,
                creatorName: user.fullName,
                creatorPhoto: user.profilePhoto
            },
            comment
        }
        post.comments.push(newComment)
        await post.save()

        const addedComment = post.comments[post.comments.length - 1]
        res.status(201).json(addedComment)
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ====================== DELETE GROUP POST COMMENT
// DELETE: api/groups/:id/posts/:postId/comments/:commentId
// PROTECTED
const deleteGroupComment = async (req, res, next) => {
    try {
        const post = await GroupPostModel.findById(req.params.postId)
        if (!post) return next(new HttpError("ไม่พบโพสต์", 404))

        const commentIndex = post.comments.findIndex(c => c._id.toString() === req.params.commentId)
        if (commentIndex === -1) return next(new HttpError("ไม่พบคอมเมนต์", 404))

        const comment = post.comments[commentIndex]
        const group = await GroupModel.findById(req.params.id)
        const isCommentOwner = comment.creator.creatorId.toString() === req.user.id.toString()
        const isGroupOwner = group?.creator.toString() === req.user.id.toString()

        if (!isCommentOwner && !isGroupOwner) {
            return next(new HttpError("คุณไม่มีสิทธิ์ลบคอมเมนต์นี้", 403))
        }

        post.comments.splice(commentIndex, 1)
        await post.save()
        res.json({ message: "ลบคอมเมนต์สำเร็จ", commentId: req.params.commentId })
    } catch (error) {
        return next(new HttpError(error))
    }
}

module.exports = { createGroup, getGroups, getGroup, joinLeaveGroup, deleteGroup, createGroupPost, getGroupPosts, deleteGroupPost, likeGroupPost, createGroupComment, deleteGroupComment }