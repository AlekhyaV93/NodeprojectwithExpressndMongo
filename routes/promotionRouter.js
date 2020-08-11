const express = require('express');
const bodyparser = require('body-parser');

const promotionsRouter = express.Router();

promotionsRouter.use(bodyparser.json());

promotionsRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end('Will send all the promotions to you');
    })
    .post((req, res) => {
        res.end(`Will add the promotion: ${req.body.name} with description: ${req.body.description}`);
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete((req, res) => {
        res.end('Deleting all promotions');
    });

promotionsRouter.route('/:promotionId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end(`Will send details of the promotions with Id:${req.params.promotionId}`);
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /promotions/${req.params.promotionId}`);
    })
    .put((req, res) => {
        res.write(`Updating the promotion with id:${req.params.promotionId}\n`);
        res.end(`The promotions is updated with name: ${req.body.name} and descriptions: ${req.body.description}`);
    })
    .delete((req, res) => {
        res.end(`Deleting the promotion with Id: ${req.params.promotionId}`);
    })


module.exports = promotionsRouter