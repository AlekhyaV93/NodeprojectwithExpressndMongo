const express = require('express');
const bodyparser = require('body-parser');

const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Campsite = require('../models/campsite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyparser.json());

favoriteRouter.route('/')
//.options(cors.corsWithOptions, (req, res) => { res.statusCode = 200 })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })//where user feild id is same as req.user._id
    .populate('user')//populating user and favorite feilds from user and campsite collection 
    .populate('favorite')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite){
            const campsites = req.body;
            campsites.forEach(camp => {
                if(favorite.favorite.indexOf(camp._id) === -1){
                    favorite.favorite.push(camp);
                }   
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }else{
            Favorite.create({user : req.user._id, favorite : req.body})
            .then(favorite=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorite');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.deleteOne({ user: req.user._id })
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch((err) => next(err));
})

favoriteRouter.route('/:favoriteId')
.options(cors.corsWithOptions, (req, res) => { res.statusCode = 200 })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorite/${req.params.favoriteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findOne({ _id : req.params.favoriteId})//checking if we are adding a valid campsite
    .then(campsite => {
        if(campsite){
            Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if(favorite){
                    if(favorite.favorite.indexOf(req.params.favoriteId) === -1){
                        favorite.favorite.push(req.params.favoriteId);
                        favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                    }  
                    else{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(`This is already a favorite!`);
                    } 
                    
                }else{
                    Favorite.create({user : req.user._id, favorite : req.params.favoriteId})
                    .then(favorite=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
        }else{
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(`A campsite with id:${req.params.favoriteId} does not exist`);
        }
    })
    .catch(err => next(err))
    

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorite/${req.params.favoriteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //the feild favorite is of type coreMongooseArray therefore used Update to update the document by removing campsite which matches req.params.favoriteId
    Favorite.updateOne( {user: req.user._id}, { $pullAll: {favorite: [req.params.favoriteId] } } )
    .then(favorite =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));

})

module.exports = favoriteRouter;