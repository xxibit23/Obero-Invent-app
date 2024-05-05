const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

router.post("/register", registerUser); // trigger 'registerUser' f(x) in controller folder when a post request is made to register page
router.post("/login", loginUser);
module.exports = router;