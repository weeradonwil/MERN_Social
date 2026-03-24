const { Schema, model } = require("mongoose")

const groupCommentSchema = new Schema({
    creator: {
        creatorId: { type: Schema.Types.ObjectId, ref: "User" },
        creatorName: { type: String },
        creatorPhoto: { type: String }
    },
    comment: { type: String, required: true }
}, { timestamps: true })

const groupPostSchema = new Schema({
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    image: { type: String },
    video: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [groupCommentSchema]
}, { timestamps: true })

module.exports = model("GroupPost", groupPostSchema)
