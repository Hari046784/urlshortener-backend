const express = require("express");
const router = express.Router();
const Users = require("../models/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");    
const nodemailer = require("nodemailer");



//SignUp function
router.post("/signup", async (req, res)=> {
    try{
        const payload = req.body;
        payload.hashedPassword = await bcrypt.hash(payload.password, 10);
        // console.log("hashed password:", payload.hashedPassword);
        // console.log("payload before:", payload);
        delete payload.password;
        // console.log("payload after:", payload);
        let user = new Users(payload);

        await user.save((err, data) => {
            if (err) {
                return res.status(400).send({
                    message: "User given email Id is already exist"
                })
            }
            return res.status(201).send({
                message: "User Sign Up successfully"
            })
        })

    }catch (error) {
        console.log("Error:", error);
        return res.status(500).send({
            message: "Internal Server Error"
        });
    };
});

//SignIn function
router.post("/signin", async (req, res) => {
    try{
        const { email, password } = req.body;
        const existingUser = await Users.findOne({email});
        console.log("existingUser:",existingUser);
        if (existingUser) {
            const isValidUser = await bcrypt.compare(password, existingUser.hashedPassword);
            console.log("isValidUser:",isValidUser);

            if (isValidUser) {
                const token = jwt.sign({_id: existingUser._id}, process.env.SECRET_KEY);
                console.log('Token: ', token);
                //persist the token as 't' in cookie with expiry date
                res.cookie("signinToken", token, {
                    expires: new Date(Date.now() + 25892000000),
                    httpOnly: true
                });
                //return response with user and token to frontend client
                const { _id, name, email } = existingUser;
                return res.status(200).send({
                    token: token,
                    user : { _id, name, email}
                });
            };

            return res.status(400).send({
                message: "Email or Password is not matched"
            })
        }
        return res.status(400).send({
            message: "User doesn't exist"
        });
    }catch (error) {
        console.log("Error:", error);
        return res.status(500).send({
            message: "Internal Server Error"
        });
    };
});

// Send a OTP function
router.post("/sendotp", async (req, res) => {
    try{
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log("OTP:", otp);

        let user = await Users.findOne({ email: req.body.email });
        console.log("User:", user);

        if (!user) {
            res.status(404).send({
                message: "User not found"
            });
        };

        //Nodemailer
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTestAccount({
            host:"smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            }
        });

        let info = await transporter.sendMail({
            from: 'Haridass046@gmail.com', // sender address
            to: req.body.email, // list of receivers
            subject: "OTP For Reset", // Subject line
            text: String(otp), // plain text body
            html: "<b>Hi Welcome!</b>", // html body 
        });

        if (info.messageId) {
            Users.updateOne({ email: req.body.email}, {otp: otp})
            .then(result => {
                res.send({code: 200, message: "OTP Sended", otp: otp })
            }).catch(error => {
                res.send({ code: 500, message: "Server Error" })
            });
        } else {
            res.send({ code: 500, message: "Server Error In Information Message" })
        };

    }catch (error) {
        console.log("Error:", error);
        return res.status(500).send({
            message: "Internal Server Error"
        });
    };
});

// Submit OTP
router.post('/submitotp', async (req, res) => {
    try {
        const payload = req.body;
        //New password hashing
        payload.hashedPassword = await bcrypt.hash(payload.password, 10)
        delete payload.password;
        Users.findOne({ otp: payload.otp }).then(result => {

            //update password
            Users.updateOne({ email: result.email }, { hashedPassword: payload.hashedPassword })
                .then(result => {
                    res.send({ code: 200, message: "Password Updated." })
                }).catch(err => {
                    res.send({ code: 500, message: "Server error" })
                })

        }).catch(error => {
            res.send({ code: 500, message: "OTP is wrong" })
        })

    } catch (error) {
        res.status(500).send({
            message: 'Internal Server Error'
        })
    }
});

// signout
router.get('/signout', (req, res) => {
    res.clearCookie('entryToken');

    return res.status(200).send({
        message: "Successfully Signed out! "
    });
})



module.exports = router;