const asyncHandler = require('express-async-handler');   // handle the try-catch
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


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

    // CREATE new user
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
        throw new Error("Please fill all fields");
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

// UPDATE User
const updateUser = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id);     // check if user exists in db using id from token 
    
    if (user) {
        const {name, email, phone, photo, bio} = user;
        user.email = email;                     // set email to old email --- user cannot be changing thier email ---
        user.name = req.body.name || name;      // set name to old name if user does not edit it
        user.phone = req.body.phone || phone;   
        user.bio = req.body.bio || bio;         
        user.photo = req.body.photo || photo;  

        const updatedUser = await user.save();

        // return response of the updated user data
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            photo: updatedUser.photo,
            bio: updatedUser.bio
        })
    } else {
        res.status(404);
        throw new Error("User not found!");
    }
})

// CHANGE password
const changePassword = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id);

    const {oldPassword, password} = req.body;

    if (!user) {
        res.status(400);
        throw new Error("User not found. Please signup");
    }
        
    // Validate
    if (!oldPassword || !password) {
        res.status(400);
        throw new Error("Please confirm password");
    }
    // Check password match in db
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    // Save new password
    if (user && passwordIsCorrect) {
        user.password = password;        // pass in db now equals pass from req.body
        await user.save();
        res.status(200).send("Password change success");
    } else {
        res.status(400)
        throw new Error("Passwords do not match!");
    }
})

// RESET forgotten password
const forgotPassword = asyncHandler( async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user) {
        res.status(404);
        throw new Error("User does not exist");
    }

    // First Delete old token from db if exists ---to have a fresh token---
    let token = await Token.findOne({userId: user._id});
    if (token) {
        await token.deleteOne()
    }

    // Create reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id      //  unique reset token

    // Hash token before saving to db   --- using sha256 algorithm ---
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Save hashed toked to db
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),      // time when reset pass was clicked
        expiresAt: Date.now() + 30 * (60 * 1000)    // expires in 30 min
    }).save();

    // Reset page url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    // The reset Email
    const message = `
        <h2>Hello ${user.name}</h2>
        <p>Please use the url below to reset your password</p>
        <p>The reset link will expire in 30 minutes</p>

        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

        <p>Obero Computer Ent.<p>
    `;
    const subject = "Reset Password";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    
    // Send the email
    try {
        await sendEmail(subject, message, send_to, sent_from)
        res.status(200).json({
        success: true,
        message: "Reset email sent"
        })
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent. Please try again")
    }
})

// export user controller functions
module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
}
