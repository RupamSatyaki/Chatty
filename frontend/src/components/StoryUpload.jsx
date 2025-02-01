import React, { useState } from "react";
import axios from "axios";

const StoryUpload = () => {
    const [media, setMedia] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("media", media);

        try {
            const response = await axios.post("http://localhost:5001/api/stories/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Story uploaded successfully!");
        } catch (error) {
            console.error("Error uploading story:", error.response ? error.response.data : error.message);
            alert("Failed to upload story. Please check the console for more details.");
        }
    };

    return (
        <form onSubmit={handleUpload}>
            <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMedia(e.target.files[0])}
                required
            />
            <button type="submit">Upload Story</button>
        </form>
    );
};

export default StoryUpload;