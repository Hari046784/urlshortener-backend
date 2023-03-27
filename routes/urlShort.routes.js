const express = require("express");
const router = express.Router();
const Url = require("../models/url.model");


// generate a short url :
function generateUrl() {
    let randomResult = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwsxz0123456789";
    let charactersLength = characters.length;

    for (let i = 0; i < 5; i++) {
        randomResult += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomResult;
};

//Create a URL:
router.post('/create', async (req, res) => {

    const urlShort = new Url({
        longUrl: req.body.longUrl,
        shortUrl: generateUrl()
    })

    await urlShort.save((err, data) => {
        if (err) throw err;
        res.status(200).send({
            message: "URL successfully updated."
        })
    })
});

//Get all URL:
router.get('/getUrl', (req, res) => {
    try {
        Url.find((err, data) => {
            if (err) {
                return res.status(400).send('Error while adding url')
            }
            res.status(201).send(data)
        });
    } catch (err) {
        res.status(500).send('Internal Server Error', err)
    };
});

//Get URL by Id:
router.get('/:urlId', (req, res) => {
    try {
        Url.findOne({ shortUrl: req.params.urlId }, (err, data) => {
            if (err) { return res.status(400).send('Error while redirect url') };

            Url.findByIdAndUpdate({ _id: data.id }, { $inc: { clickCount: 1 } }, (err, data) => {
                if (err) { return res.status(400).send('Error while redirect url') }
                res.redirect(data.longUrl)

            })
        });
    } catch (err) {
        res.status(500).send('Internal Server Error', err)
    };
});

//delete URl

router.delete('/deleteUrl/:id', (req, res) => {
    try {
        Url.deleteOne({ _id: req.params.id }, (err, data) => {
            if (err) {
                return res.status(400).send('Error while removing URL')
            }
            res.status(201).send("URL removed successfully")
        });
    } catch (err) {
        res.status(500).send('Internal Server Error', err)
    };
});


module.exports = router;
