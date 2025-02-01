import express from "express";
import upload from "../middleware/multer.js"; // Import multer setup
import { uploadStory, getStories, likeStory } from "../controllers/story.controller.js"; // Import new controller functions

const router = express.Router();

// Add new routes for stories
router.post("/stories/upload", upload.single("media"), uploadStory); // Upload story
router.get("/stories", getStories); // Get all stories
router.post("/stories/:id/like", likeStory); // Like a story

export default router;
