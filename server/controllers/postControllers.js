const HttpError = require('../models/errorModel')
const PostModel = require('../models/postModel')
const UserModel = require('../models/userModel')

const { v4: uuid } = require('uuid')
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')
const path = require('path')






// ============================= CREATE POST 
// POST : api/posts
// PROTECTED

const createPost = async (req, res, next) => {
    try {
        const { body } = req.body;
        if (!body) {
            return next(new HttpError("กรอกข้อความในช่องโพสต์", 422))
        }

        let imageUrl = null;
        let videoUrl = null;

        // อัปโหลดรูปภาพ (ถ้ามี)
        if (req.files && req.files.image) {
            const { image } = req.files;
            if (image.size > 5000000) {
                return next(new HttpError("รูปภาพใหญ่เกินไป ควรมีขนาดเล็กกว่า 5MB", 422))
            }
            let fileName = image.name.split(".");
            let newFileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];
            await image.mv(path.join(__dirname, '..', 'uploads', newFileName));
            const result = await cloudinary.uploader.upload(path.join(__dirname, '..', 'uploads', newFileName), { resource_type: "image" });
            if (result.secure_url) imageUrl = result.secure_url;
        }

        // อัปโหลดวิดีโอ (ถ้ามี)
        if (req.files && req.files.video) {
            const { video } = req.files;
            if (video.size > 50000000) {
                return next(new HttpError("วิดีโอใหญ่เกินไป ควรมีขนาดเล็กกว่า 50MB", 422))
            }
            let fileName = video.name.split(".");
            let newFileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];
            await video.mv(path.join(__dirname, '..', 'uploads', newFileName));
            const result = await cloudinary.uploader.upload(path.join(__dirname, '..', 'uploads', newFileName), { resource_type: "video" });
            if (result.secure_url) videoUrl = result.secure_url;
        }

        const newPost = await PostModel.create({
            creator: req.user.id,
            body,
            image: imageUrl,
            video: videoUrl
        });
        await UserModel.findByIdAndUpdate(newPost?.creator, { $push: { posts: newPost?._id } });
        res.json(newPost);

    } catch (error) {
        return next(new HttpError(error))
    }
}

















// ============================= GET POST 
// GET : api/posts/:id
// PROTECTED

const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await PostModel.findById(id)
      .populate("creator")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } }
      });

    res.json(post);
  } catch (error) {
    return next(new HttpError(error.message || "Server Error", 500));
  }
}














// ============================= GET POSTS
// GET : api/posts
// PROTECTED

const getPosts = async (req, res, next) => {
    try {
        const posts = await PostModel.find().sort({ createdAt: -1 });
        res.json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}














// ============================= UPDATE POST 
// PATCH : api/posts/:id
// PROTECTED

const updatePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const { body } = req.body;
        // รับโพสต์จากฐานข้อมูล
        const post = await PostModel.findById(postId);
        // ตรวจสอบว่าผู้สร้างโพสต์เป็นผู้ใช้ที่เข้าสู่ระบบอยู่หรือไม่
        if (post?.creator != req.user.id) {
            return next(new HttpError("คุณไม่สามารถแก้ไขโพสต์นี้ได้ เนื่องจากคุณไม่ใช่ผู้สร้างโพสต์", 403))
        }
        const updatedPost = await PostModel.findByIdAndUpdate(postId, { body }, { new: true })
        res.json(updatedPost).status(200)

    } catch (error) {
        return next(new HttpError(error))
    }
}
















// ============================= DELETE POST 
// DELETE : api/posts/:id
// PROTECTED

const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        // ดึงข้อมูล POST จากฐานข้อมูล
        const post = await PostModel.findById(postId);
        // ตรวจสอบว่าผู้สร้างโพสต์เป็นผู้ใช้ที่เข้าสู่ระบบอยู่หรือไม่
        if (post?.creator != req.user.id) {
            return next(new HttpError("คุณไม่สามารถแก้ไขโพสต์นี้ได้ เนื่องจากคุณไม่ใช่ผู้สร้างโพสต์", 403))
        }
        const deletedPost = await PostModel.findByIdAndDelete(postId);
        await UserModel.findByIdAndUpdate(post?.creator, { $pull: { posts: post?._id } })
        res.json(deletedPost)
    } catch (error) {
        return next(new HttpError(error))
    }
}











// ============================= GET FOLLOWINGS POSTS
// GET : api/posts/following
// PROTECTED

const getFollowingPosts = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id);
        const posts = await PostModel.find({ creator: { $in: user?.following } })
        res.json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}














// ============================= LIKE-DISLIKE POSTS
// GET : api/posts/:id/like
// PROTECTED

const likeDislikePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await PostModel.findById(id);
        // ตรวจสอบว่าผู้ใช้ที่เข้าสู่ระบบได้กดไลค์โพสต์นั้นแล้วหรือไม่
        let updatedPost;
        if (post?.likes.includes(req.user.id)) {
            updatedPost = await PostModel.findByIdAndUpdate(id, { $pull: { likes: req.user.id } }, { new: true })
        } else {
            updatedPost = await PostModel.findByIdAndUpdate(id, { $push: { likes: req.user.id } }, { new: true })
        }
        res.json(updatedPost)

    } catch (error) {
        return next(new HttpError(error))
    }
}














// ============================= GET USER POSTS 
// GET : api/posts/:id/posts
// PROTECTED

const getUserPosts = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const posts = await UserModel.findById(userId).populate({
            path: "posts", options: {
                sort: {
                    createdAt:
                        -1
                }
            }
        })
        res.json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}









// ============================= CREATE BOOKMARK 
// POST : api/posts/:id/bookmark
// PROTECTED

const createBookmark = async (req, res, next) => {
    try {
        const { id } = req.params;
        // ค้นหาผู้ใช้และตรวจสอบว่าโพสต์นั้นอยู่ในบุ๊กมาร์กของเขาแล้วหรือไม่ ถ้าใช่ ให้ลบโพสต์นั้นออก แต่ถ้ายังไม่เคยอ่าน ให้เพิ่มโพสต์นั้นลงในบุ๊กมาร์ก
        const user = await UserModel.findById(req.user.id);
        const postIsBookmarked = user?.bookmarks?.includes(id)
        if (postIsBookmarked) {
            const updatedUser = await UserModel.findByIdAndUpdate(
                req.user.id,
                { $pull: { bookmarks: id } },
                { new: true }
            )
            res.json(updatedUser)
        } else {
            const updatedUser = await UserModel.findByIdAndUpdate(
                req.user.id,
                { $push: { bookmarks: id } },
                { new: true }
            )
            res.json(updatedUser)
        }
    } catch (error) {
        return next(new HttpError(error))
    }
}













// ============================= GET BOOKMARKS 
// GET : api/bookmarks
// PROTECTED

const getUserBookmarks = async (req, res, next) => {
    try {
        const userBookmarks = await UserModel.findById(req.user.id).populate({
            path: "bookmarks", options:
                { sort: { createdAt: -1 } }
        })
        res.json(userBookmarks);
    } catch (error) {
        return next(new HttpError(error))
    }
}


module.exports = {
    createPost, updatePost, deletePost, getPost, getPosts,
    getUserPosts, getUserBookmarks, createBookmark, likeDislikePost, getFollowingPosts
}