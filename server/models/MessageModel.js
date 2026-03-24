const {Schema, model} = require("mongoose")


const messageSchema = new Schema({
    conversationId: {type: Schema.Types.ObjectId, ref: "Conversation", required: true},
    senderId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    text: {type: String},
    image: {type: String},
    video: {type: String}
}, {timestamps: true})

module.exports = model("Message", messageSchema)