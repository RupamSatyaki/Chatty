import React, { useEffect, useState } from "react";
import axios from "axios";

const StoryDisplay = () => {
    const [stories, setStories] = useState([]);

    const fetchStories = async () => {
        try {
            const response = await axios.get("http://localhost:5001/api/stories");
            if (Array.isArray(response.data)) {
                setStories(response.data);
            } else {
                console.error("Expected an array of stories, but got:", response.data);
                setStories([]); // Reset to empty array if the response is not as expected
            }
        } catch (error) {
            console.error("Error fetching stories:", error);
            setStories([]); // Reset to empty array on error
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    return (
        <div>
            <h2>Stories</h2>
            <div className="story-container">
                {stories.length > 0 ? (
                    stories.map((story) => (
                        <div key={story._id} className="story">
                            <img src={story.mediaUrl} alt="Story" />
                            <p>{story.likes} Likes</p>
                            <button onClick={() => handleLike(story._id)}>Like</button>
                        </div>
                    ))
                ) : (
                    <p>No stories available.</p>
                )}
            </div>
        </div>
    );
};

const handleLike = async (storyId) => {
    try {
        await axios.post(`/api/stories/${storyId}/like`);
        alert("Story liked!");
    } catch (error) {
        console.error("Error liking story:", error);
    }
};

export default StoryDisplay;