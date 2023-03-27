const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true
    },
    email:{
        type: String,
        trim: true,
        unique: true,
        required: "Email is mandatory"
    },
    hashedPassword: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 0
    },
    otp: {
        type: Number,
        default: 0
    }

});

module.exports = mongoose.model("User", userSchema);