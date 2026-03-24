const { Schema, model } = require("mongoose")

const groupSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: Schema.Types.ObjectId, ref: "GroupPost" }]
}, { timestamps: true })

module.exports = model("Group", groupSchema)
