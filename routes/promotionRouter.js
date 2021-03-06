const express = require('express');
const bodyparser = require('body-parser');
const Promotion = require('../models/promotion');
const authenticate = require('../authenticate');
const cors = require('./cors');

const promotionsRouter = express.Router();

promotionsRouter.use(bodyparser.json());

promotionsRouter.route('/')//routing based on the url
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
//configuring response based on the type of the HTTP request 
//also verifying that only admins can post or delete partners data
.get((req, res, next) => {
    //using find static method of mongoose to read the contents in promotions collection
    Promotion.find()
        .then(promotions => {
            res.statusCode = 200;//setting the status code
            res.setHeader('Content-Type', 'application/json');//setting the response headers
            res.json(promotions);//sending the response(promotions data) in json format
        })
        .catch(err => next(err))//catching errors if any
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.create(req.body)//using create method to create or insert a document in the promotions collection by sending req.body
        .then(promotions => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);
        })
        .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;//setting status code to 403 which is a forbidden error
    res.end('PUT operation not supported on /partners');//sending response a string
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.deleteMany()//deleting documents in the collection
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err))

});

//configuring response for requests with promotionId
promotionsRouter.route('/:promotionId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
.get((req, res, next) => {
    Promotion.findById(req.params.promotionId)//finding a promotion based on promotionId that is obtained from req.params
        .then(promotions => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);
        })
        .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /partners/${req.params.promotionId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    //finding a document from partners collection based on promotion id and setting/updating its feild to contents in req.body
    Promotion.findByIdAndUpdate(req.params.promotionId, {
        $set: req.body
    }, {
        new: true
    })
        .then(promotions => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);
        })
        .catch(err => next(err))

})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.findByIdAndDelete(req.params.promotionId)//finding and deleting a document based on Id
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err))

});

module.exports = promotionsRouter//exporting promotionsRouter module