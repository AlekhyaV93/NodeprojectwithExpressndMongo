const express = require('express');
const bodyparser = require('body-parser');
const Campsite = require('../models/campsite');
const { response } = require('express');

const campsiteRouter = express.Router();//using the built-in Router middleware of the express

campsiteRouter.use(bodyparser.json());

campsiteRouter.route('/')//routing based on the endpoint ex:here all the requests from http://localhost:3000/campsites are handled
//configuring response based on the type of the HTTP request 
    .get((req, res, next) => {
        Campsite.find()
        .then(campsites => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsites);
        })
        .catch(err=>next(err));  
    })
    .post((req, res,next) => {
        Campsite.create(req.body)
        .then(campsites => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsites);
        })
        .catch(err=>next(err));
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete((req, res, next) => {
        Campsite.deleteMany()
        .then(response => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(response);
        })
        .catch(err=>next(err));
    });

campsiteRouter.route('/:campsiteId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsites => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsites);
        })
        .catch(err=>next(err));  
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .put((req, res, next) => {
        Campsite.findByIdAndUpdate(req.params.campsiteId,{
            $set:req.body
        },{
            new:true
        }).then(campsites => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsites);
        })
        .catch(err=>next(err)); 
    })
    .delete((req, res,next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
        .then(response => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(response);
        })
        .catch(err=>next(err)); 
    })


module.exports = campsiteRouter