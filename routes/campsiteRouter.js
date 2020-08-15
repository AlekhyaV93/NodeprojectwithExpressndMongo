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

    campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if(campsite){
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsite.comments);
            }else{
                err = new Error(`Campsite ${req.params.campsiteId} does not exist`);
                err.status=403;
                return next(err);

            }
        })
        .catch(err=>next(err));  
    })
    .post((req, res,next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if(campsite){
            campsite.comments.push(req.body);
            campsite.save()
            .then(campsite => {
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(campsite);
            })
            .catch(err=>next(err)); 
            }else{
                err = new Error(`Campsite ${req.params.campsiteId} does not exist`);
                err.status=403;
                return next(err);
            }
        })
        .catch(err=>next(err));  
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if(campsite){
            for(let i=campsite.comments.length-1;i>=0;i--){
                campsite.comments.id(campsite.comments[i]._id).remove();
            }
            campsite.save()
            .then(campsite => {
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(campsite);
            })
            .catch(err=>next(err)); 
            }else{
                err = new Error(`Campsite ${req.params.campsiteId} does not exist`);
                err.status=403;
                return next(err);
            }
        })
        .catch(err=>next(err));  
    });

    campsiteRouter.route('/:campsiteId/comments/:commentsId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if(campsite && campsite.comments.id(req.params.commentsId)){
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsite.comments.id(req.params.commentsId));
            }
            else if(!campsite){
                err = new Error(`Campsite ${req.params.campsiteId} does not exist`);
                err.status=403;
                return next(err);

            }else{
                err = new Error(`Comment ${req.params.commentsId} does not exist`);
                err.status=403;
                return next(err);
            }
        })
        .catch(err=>next(err));  
    })
    .post((req, res,next) => {
       res.statusCode = 403;
       res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentsId}`);
    })
    .put((req, res) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if(campsite && campsite.comments.id(req.params.commentsId)){
                if(req.body.text){
                    campsite.comments.id(req.params.commentsId).text = req.body.text;
                }
                if(req.body.rating){
                    campsite.comments.id(req.params.commentsId).rating = req.body.rating;
                }
                campsite.save()
                .then(campsite=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(campsite);
                })
                .catch(err=>next(err)); 
            
            }
            else if(!campsite){
                err = new Error(`Campsite ${req.params.campsiteId} does not exist`);
                err.status=403;
                return next(err);

            }else{
                err = new Error(`Comment ${req.params.commentsId} does not exist`);
                err.status=403;
                return next(err);
            }
        })
        .catch(err=>next(err));  
       
    })
    .delete((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if(campsite && campsite.comments.id(req.params.commentsId)){
            campsite.comments.id(req.params.commentsId).remove();
            campsite.save()
            .then(campsite=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(campsite);
            })
            .catch(err=>next(err));  
            }
            else if(!campsite){
                err = new Error(`Campsite ${req.params.campsiteId} does not exist`);
                err.status=403;
                return next(err);

            }else{
                err = new Error(`Comment ${req.params.commentsId} does not exist`);
                err.status=403;
                return next(err);
            }
        })
        .catch(err=>next(err));  
    });

module.exports = campsiteRouter