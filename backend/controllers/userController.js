const asyncHandler = require('express-async-handler');   // handle the try-catch
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Generate a token with jsonwebtoken for logged-in user
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
} 

//  REGISTER User function
const registerUser = asyncHandler( async (req, res) => {
    const {name, email, password} = req.body;

    // validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all fields")
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be 6 characters of more")
    }

    // check if email already exists in db
    const userExists = await User.findOne({email})
    if (userExists) {
        res.status(400);
        throw new Error("Email is taken")
    }

    // Create new user
    const user = await User.create({
        name, 
        email,
        password
    });

    // execute generate user token
    const token = generateToken(user._id)

    // Send HTTP-only cookie of the token after creating user
    res.cookie("token", token, {
        path: "/",          // cookie path 
        httpOnly: true,     // make cookie accessibly only by the web server
        expires: new Date(Date.now() + 1000 * 86400),   // 1 day
        sameSite: "none",   // different url for frontend & backend, thus cookies should still work
        secure: true        // using https
    })

    if (user) {
        const {_id, name, email, phone, photo, bio} = user
        res.status(201).json({
            _id,
            name,
            email,
            phone,
            photo,
            bio,
            token
        })
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// LOGIN user function 
const loginUser = asyncHandler( async (req, res) => {
    
    const {email, password} = req.body;

    // Validation
    if (!email || !password) {
        res.status(400);
        throw new Error("Pleae fill all fields");
    }

    // Check if user exist in db
    const user = await User.findOne({email});
    if (!user) {
        res.status(400);
        throw new Error("User not found, please singup");
    }    
    // if user exist, check password match
    const passwordCorrect = await bcrypt.compare(password, user.password);  // decrypt and compare hashed password from db with input password
    
    // execute generate user token
    const token = generateToken(user._id)

    // Send hTTP-only cookie of the token after loging in user
    res.cookie("token", token, {
        path: "/",          // cookie path 
        httpOnly: true,     // make cookie accessibly only by the web server
        expires: new Date(Date.now() + 1000 * 86400),   // 1 day
        sameSite: "none",   // different url for frontend & backend, thus cookies should still work
        secure: true        // using https
    })

    if (user && passwordCorrect) {
        const {_id, name, email, phone, photo, bio} = user
        res.status(200).json({
            _id,
            name,
            email,
            phone,
            photo,
            bio,
            token
        })
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
})

// LOGOUT user function
const logout = asyncHandler( async (req, res) => {
    // Expire the cookie to destroy user session
    res.cookie("token", "", {
        path: "/",          
        httpOnly: true,    
        expires: new Date(0),   // set day to 0 to expire the cookie
        sameSite: "none",
        secure: true 
    })
    return res.status(200).json({
        message: "Logged out"
    });
})

// Get user data --- if user is logged in ---
const getUser = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const {_id, name, email, phone, photo, bio} = user
        res.status(200).json({
            _id,
            name,
            email,
            phone,
            photo,
            bio
        })
    } else {
        res.status(400);
        throw new Error("User not found");
    }
});

// Return bool login status, using the cookie token
const loginStatus = asyncHandler( async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false);    // false for  user !logged-in
    } 
    
    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
        return res.json(true);   // true for user is logged-in
    }
    return res.json(false);
})

// Update User
const updateUser = asyncHandler( async (req, res) => {
    res.send("User updated")
})
// export user controller functions
module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
}
