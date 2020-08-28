const express = require('express');
const bodyparser = require('body-parser');
const Campsite = require('../models/campsite');
const { response } = require('express');
const authenticate = require('../authenticate');

const campsiteRouter = express.Router();//using the built-in Router middleware of the express

campsiteRouter.use(bodyparser.json());

campsiteRouter.route('/')//routing based on the endpoint ex:here all the requests from http://localhost:3000/campsites are handled
//configuring response based on the type of the HTTP request 
    .get((req, res, next) => {
        Campsite.find()
        .populate('comments.author')
        .then(campsites => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsites);
        })
        .catch(err=>next(err));  
    })
    .post(
        authenticate.verifyUser, authenticate.verifyAdmin, (req, res,next) => {
        Campsite.create(req.body)
        .then(campsites => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsites);
        })
        .catch(
            err=>next(err)
            );
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//#2
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
        .populate('comments.author')
        .then(campsites => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsites);
        })
        .catch(err=>next(err));  
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res,next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
        .then(response => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(response);
        })
        .catch(err=>next(err)); 
    })

    //configuring response to requests whose url contains :campsiteId/comments
    campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
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
    .post(authenticate.verifyUser, (req, res,next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if(campsite){
            req.body.author=req.user._id;
            campsite.comments.push(req.body);//If a campsite document with the Id exists, the comments are pushed to the comments field
            campsite.save()//saving the changes after manipulating the document
            .then(campsite => {
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(campsite);
            })
            .catch(err=>next(err)); 
            }else{
                //error if the campsite with the id not found
                err = new Error(`Campsite ${req.params.campsiteId} does not exist`);
                err.status=403;
                return next(err);
            }
        })
        .catch(err=>next(err));  
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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

    //configuring response to requests whose url contains :campsiteId/comments/:commentsId
    campsiteRouter.route('/:campsiteId/comments/:commentsId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
        .then(campsite => {
            //If the campsite with the Id contains a comment with the Id we are sending it in the response
            if(campsite && campsite.comments.id(req.params.commentsId)){
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(campsite.comments.id(req.params.commentsId));
            }
            //returing error if either of it does not exist
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
    .post(authenticate.verifyUser, (req, res,next) => {
       res.statusCode = 403;
       res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentsId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if(campsite && campsite.comments.id(req.params.commentsId)){
                const id1 = req.user._id;
                const id2 = campsite.comments.id(req.params.commentsId).author._id;
                //console.log(id1);
                //console.log(id2);
                if(id1.equals(id2)){
                    //updating few feilds of comment with data from req.body
                    if(req.body.text){
                        campsite.comments.id(req.params.commentsId).text = req.body.text;
                    }
                    if(req.body.rating){
                        campsite.comments.id(req.params.commentsId).rating = req.body.rating;
                    }
                    //saving changes after updating
                    campsite.save()
                    .then(campsite=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(campsite);
                    })
                    .catch(err=>next(err)); 
                }else{
                    err = new Error('You are not accessed to modify the comment');
                    err.status=403;
                    return next(err);
                }
            
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
    .delete(authenticate.verifyUser, (req, res, next) => {//#4
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if(campsite && campsite.comments.id(req.params.commentsId))
            {
            const id2 = req.user.id;
            const id1 = campsite.comments.id(req.params.commentsId).author._id;
            if(id1.equals(id2)){
                //removing the comment with the commentId
                campsite.comments.id(req.params.commentsId).remove();
                campsite.save()
                .then(campsite=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(campsite);
                })
                .catch(err=>next(err));  
            }
            else{
                err = new Error(`Cannot delete this comment`);
                err.status=403;
                return next(err);
            }
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

module.exports = campsiteRouter//exporting campsiteRouter 