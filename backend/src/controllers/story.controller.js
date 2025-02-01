import Story from "../models/story.model.js"; // Import the Story model

// Upload a new story
export const uploadStory = async (req, res) => {
  try {
    const { userId } = req.user; // Get the user ID from the request
    const mediaUrl = req.file.path; // Get the uploaded file path

    const newStory = new Story({
      userId,
      mediaUrl,
    });

    await newStory.save();
    res.status(201).json(newStory);
  } catch (error) {
    console.log("Error uploading story:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all stories
export const getStories = async (req, res) => {
  try {
    const stories = await Story.find().populate("userId", "fullName profilePic").sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    console.log("Error fetching stories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Like a story
export const likeStory = async (req, res) => {
  const { id } = req.params; // Get the story ID from the request parameters
  try {
    const story = await Story.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.status(200).json(story);
  } catch (error) {
    console.log("Error liking story:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
