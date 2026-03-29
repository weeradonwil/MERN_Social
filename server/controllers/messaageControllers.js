const HttpError = require("../models/errorModel")
const ConversationModel = require("../models/ConversationModel")
const MessageModel = require("../models/MessageModel");
const { getReceiverSocketId, io } = require("../socket/socket");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const { v4: uuid } = require("uuid");



// ====================== Create Message
// POST: api/messages/:receiverId
// PROTECTED
const createMessage = async (req, res, next) => {
    try {
        const { receiverId } = req.params;
        const { messageBody } = req.body;

        if (!messageBody && !(req.files && (req.files.image || req.files.video))) {
            return next(new HttpError("กรุณากรอกข้อความหรือเลือกไฟล์", 422))
        }

        let imageUrl = null;
        let videoUrl = null;

        if (req.files && req.files.image) {
            const { image } = req.files;
            if (image.size > 5000000) return next(new HttpError("รูปภาพใหญ่เกินไป ควรน้อยกว่า 5MB", 422))
            let fileName = image.name.split(".");
            let newFileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];
            await image.mv(path.join(__dirname, "..", "uploads", newFileName));
            const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFileName), { resource_type: "image" });
            if (result.secure_url) imageUrl = result.secure_url;
        }

        if (req.files && req.files.video) {
            const { video } = req.files;
            if (video.size > 50000000) return next(new HttpError("วิดีโอใหญ่เกินไป ควรน้อยกว่า 50MB", 422))
            let fileName = video.name.split(".");
            let newFileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];
            await video.mv(path.join(__dirname, "..", "uploads", newFileName));
            const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFileName), { resource_type: "video" });
            if (result.secure_url) videoUrl = result.secure_url;
        }

        // หา/สร้าง conversation
        let conversation = await ConversationModel.findOne({ participants: { $all: [req.user.id, receiverId] } })
        if (!conversation) {
            conversation = await ConversationModel.create({
                participants: [req.user.id, receiverId],
                lastMessage: { text: messageBody || "📷 รูปภาพ", senderId: req.user.id }
            })
        }

        // สร้างข้อความ
        const newMessage = await MessageModel.create({
            conversationId: conversation._id,
            senderId: req.user.id,
            text: messageBody || "",
            image: imageUrl,
            video: videoUrl
        })
        await conversation.updateOne({ lastMessage: { text: messageBody || "📷 รูปภาพ", senderId: req.user.id } })

        // ส่งผ่าน socket แบบ real-time
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", { ...newMessage.toObject(), receiverId });
        }

        res.json(newMessage)

    } catch (error) {
        return next(new HttpError(error))
    }
}














// ====================== GET Messages
// POST: api/messages/:receiverId
// PROTECTED
const getMessages = async (req, res, next) => {
    try {
        const { receiverId } = req.params;
        const conversation = await ConversationModel.findOne({ participants: { $all: [req.user.id, receiverId] } })
        if (!conversation) {
            return next(new HttpError("คุณไม่ได้สนทนากับบุคคลนี้", 404))
        }
        const messages = await MessageModel.find({ conversationId: conversation._id }).sort({ createAt: 1 })
        res.json(messages)

    } catch (error) {
        return next(new HttpError(error))
    }
}










// ====================== GET Conversations
// GET: api/conversations
// PROTECTED
const getConversations = async (req, res, next) => {
    try {
        let conversations = await ConversationModel.find({ participants: req.user.id }).populate({
            path: "participants",
            select: "fullName profilePhoto"
        }).sort({ createdAt: -1 });
        //remove logged in user from the participants array
        conversations.forEach((conversation) => {
            conversation.participants = conversation.participants.filter(
                (participant) => participant._id.toString() !== req.user.id.toString()
            );
        });

        res.json(conversations)
    } catch (error) {
        return next(new HttpError(error))
    }
}





// ====================== DELETE Conversation
// DELETE: api/conversations/:receiverId
// PROTECTED
const deleteConversation = async (req, res, next) => {
    try {
        const { receiverId } = req.params
        const conversation = await ConversationModel.findOne({
            participants: { $all: [req.user.id, receiverId] }
        })
        if (!conversation) return next(new HttpError("ไม่พบการสนทนา", 404))

        await MessageModel.deleteMany({ conversationId: conversation._id })
        await ConversationModel.findByIdAndDelete(conversation._id)

        res.json({ message: "ลบการสนทนาสำเร็จ" })
    } catch (error) {
        return next(new HttpError(error))
    }
}

module.exports = { createMessage, getMessages, getConversations, deleteConversation }