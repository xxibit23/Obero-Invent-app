const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController');

router.post("/register", registerUser) // trigger 'registerUser' f(x) in controller folder when a post request is made to register page

module.exports = router;