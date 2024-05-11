const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logout, getUser, loginStatus, updateUser, changePassword, forgotPassword } = require('../controllers/userController');
const protect = require('../middleWare/authMiddleware');

// trigger 'user' functions in controller folder when a post request is made to register page
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);
router.get("/logged-in", loginStatus);
router.patch("/updateuser", protect, updateUser);   // patch helps partially update our user details 
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);

module.exports = router;    