//Importing the dotenv module
require('dotenv').config();

//Importing the express module
const express = require("express");

//Importing the DB
const db = require("./db/connect");

//Importing the cors
const cors = require("cors");

//Initializing the express
const app = express();

// Calling the express.json() method for parsing and call cors
app.use(express.json());
app.use(cors());

// To connect DB
db();

// Importing the routes
const authRoutes = require('./routes/auth.routes');
const urlShortRoutes = require('./routes/urlShort.routes');

//Adding the custom middleware
app.use("/api", authRoutes);
app.use("/api", urlShortRoutes);

//Testing
app.get("/", (req, res)=>{
    res.status(200).send("Welcome to my URL Shortener Application");
})

//Initializing the port number
const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log(`Application is running on PORT ${PORT}`);
});