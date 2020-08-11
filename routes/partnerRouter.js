const express = require('express');
const bodyparser = require('body-parser');

const partnersRouter = express.Router();

partnersRouter.use(bodyparser.json());

partnersRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end('Will send all the partners to you');
    })
    .post((req, res) => {
        res.end(`Will add the partner: ${req.body.name} with description: ${req.body.description}`);
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete((req, res) => {
        res.end('Deleting all partners');
    });

partnersRouter.route('/:partnerId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end(`Will send details of the partners with Id:${req.params.partnerId}`);
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put((req, res) => {
        res.write(`Updating the partner with id:${req.params.partnerId}\n`);
        res.end(`The partners is updated with name: ${req.body.name} and descriptions: ${req.body.description}`);
    })
    .delete((req, res) => {
        res.end(`Deleting the partner with Id: ${req.params.partnerId}`);
    })


module.exports = partnersRouter