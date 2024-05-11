const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const errorHandler = require('./middleWare/errorMiddleware');
const cookieParser = require('cookie-parser');

const app = express();

// Middlewares
app.use(express.json());        // help handle json data
app.use(cookieParser());        // to help store user token
app.use(express.urlencoded({extended: false}))  // handle data via url
app.use(bodyParser.json());
app.use(cors());

// Routes Middleware - for user route functions
app.use("/api/users", userRoute)

// Routes 
app.get("/", (req, res) => {
    res.send("Home Page");
})

// Error Middleware
app.use(errorHandler);

// connect to db & start server
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server Running on port ${PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })