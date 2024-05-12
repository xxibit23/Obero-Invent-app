const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const productRoute = require('./routes/productRoute');
const errorHandler = require('./middleWare/errorMiddleware');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());        // help handle json data
app.use(cookieParser());        // to help store user token
app.use(express.urlencoded({extended: false}))  // handle data via url
app.use(bodyParser.json());
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes Middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);

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