import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h' // Automatically remove the document after 24 hours
  },
  likes: {
    type: Number,
    default: 0,
  },
});

const Story = mongoose.model("Story", storySchema);
export default Story;
