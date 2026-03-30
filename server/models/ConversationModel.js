const { Schema, model } = require("mongoose");

const conversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessage: {
        text: { type: String, required: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User" }
    },
    deletedBy: [{
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        deletedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true })

module.exports = model("Conversation", conversationSchema)