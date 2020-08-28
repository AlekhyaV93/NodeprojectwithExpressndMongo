const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const Partner = require('../models/partner');
const { response } = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');

const partnersRouter = express.Router();

partnersRouter.use(bodyparser.json());


partnersRouter.route('/')//routing based on the url
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
//configuring response based on the type of the HTTP request 
.get(cors.cors, (req, res, next) => {
    //using find static method of mongoose to read the contents in partners collection
    Partner.find()
        .then(partners => {
            res.statusCode = 200;//setting the status code
            res.setHeader('Content-Type', 'application/json');//setting the response headers
            res.json(partners);//sending the response(partners data) in json format
        })
        .catch(err => next(err))//catching errors if any
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.create(req.body)//using create method to create or insert a document in the partners collection by sending req.body
        .then(partners => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partners);
        })
        .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;//setting status code to 403 which is a forbidden error
    res.end('PUT operation not supported on /partners');//sending response a string
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.deleteMany()//deleting documents in the collection
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err))

});

//configuring response for requests with partnerId
partnersRouter.route('/:partnerId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
.get(cors.cors, (req, res, next) => {
    Partner.findById(req.params.partnerId)//finding a partner based on partnerId that is obtained from req.params
        .then(partners => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partners);
        })
        .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    //finding a document from partners collection based on partner id and setting/updating its feild to contents in req.body
    Partner.findByIdAndUpdate(req.params.partnerId, {
        $set: req.body
    }, {
        new: true
    })
        .then(partners => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partners);
        })
        .catch(err => next(err))

})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId)//finding and deleting a document based on Id
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err))

});

module.exports = partnersRouter//exporting partnersRouter module