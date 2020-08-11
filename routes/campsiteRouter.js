const express = require('express');
const bodyparser = require('body-parser');

const campsiteRouter = express.Router();//using the built-in Router middleware of the express

campsiteRouter.use(bodyparser.json());

campsiteRouter.route('/')//routing based on the endpoint ex:here all the requests from http://localhost:3000/campsites are handled
//configuring response based on the type of the HTTP request 
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end('Will send all the campsites to you');
    })
    .post((req, res) => {
        res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);//
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete((req, res) => {
        res.end('Deleting all campsites');
    });

campsiteRouter.route('/:campsiteId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end(`Will send details of the campsite with Id:${req.params.campsiteId}`);
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .put((req, res) => {
        res.write(`Updating the campsite with is:${req.params.campsiteId}\n`);
        res.end(`The campsite is updated with name: ${req.body.name} and descriptions: ${req.body.description}`);
    })
    .delete((req, res) => {
        res.end(`Deleting the campsite with Id: ${req.params.campsiteId}`);
    })


module.exports = campsiteRouter