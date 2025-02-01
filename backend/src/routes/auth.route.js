import express from "express";
import jwt from "jsonwebtoken";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

// Add this route to your server (backend)
router.get('/auth/check', (req, res) => {
    try {
        // Example using JWT in cookies
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json(null);

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json(null);

            const user = await User.findById(decoded.userId);
            res.status(200).json(user || null);
        });
    } catch (error) {
        res.status(500).json(null);
    }
});

export default router;
