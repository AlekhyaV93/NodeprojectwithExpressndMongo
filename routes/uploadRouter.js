const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

//configuring that the uploaded image should be stored at public/image folder and stored as it is without changing its name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

//accepting only image files for upload
const imageFileFilter = (req, file, cb) => {
    if (file.originalname.match(/\.(jpg|png|jpeg|gif)$/)) {
        return cb(new Error('You can upload image files only!', false));
    }
    cb(null, true);
}

const upload = multer({ storage: storage }, { fileFilter: imageFileFilter });//using above configurations in multer

const uploadRouter = express.Router();


uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('get operation not supported on /imageUpload');//sending the recieved file, formatted by muller in the response body
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);//sending the uploaded file as response
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('put operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('delete operation not supported on /imageUpload');
})

module.exports = uploadRouter;