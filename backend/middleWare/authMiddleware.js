const asyncHandler = require('express-async-handler');   // handle the try-catch
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Function to check if user is logged in before taken to profile page
// Is included in 'getUser' router in userRouter & others
const protect = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            res.status(401);
            throw new Error("Unauthorized access, Please login");
        }
        
        // If there is token, Verify it
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        // Get user id from db using id from Token
        const user = await User.findById(verified.id).select("-password");  // exclude password from db result
        if (!user) {
            res.status(404);
            throw new Error("User not found!");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new Error("Unauthorized access, Please login");
    }
});

module.exports = protect;