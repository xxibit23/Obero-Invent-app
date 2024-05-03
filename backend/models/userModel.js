const mongoose = require('mongoose');

// user model containing validating infos
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter valid email"
        ]
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, "Password must be 6 characters or more"],
        maxLength: [20, "Password can't more than 20 characters"],
    },
    photo: {
        type: String,
        required: [true, "Please select a photo"],
        default: "../alt-images/alt-user.png"
    },
    phone: {
        type: String,
        default: "+233"
    },
    bio: {
        type: String,
        maxLength: [250, "Bio can't be more than 250 character"],
        default: "bio"
    }
}, {
    timestamps: true,
})

const User = mongoose.model('User', userSchema);
module.exports = User;