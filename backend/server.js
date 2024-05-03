const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute');

const app = express();

// Middlewares
app.use(express.json());        // help handle json data
app.use(express.urlencoded({extended: false}))  // handle data via url
app.use(bodyParser.json());

// Routes Middleware - for user registration
app.use("/api/users", userRoute)

// Routes 
app.get("/", (req, res) => {
    res.send("Home Page");
})

// connect to db & start server
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server Running of port ${PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })