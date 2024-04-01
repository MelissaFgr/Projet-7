const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth');
const multerMiddleware = require('../middlewares/multer');
const bookController = require('../controllers/book');

function createRoute(route, middlewares, controllerMethod) {
    router[route.method](route.path, ...middlewares, controllerMethod);
}

const routes = [
    { method: 'post', path: '/', middlewares: [authMiddleware, multerMiddleware], controllerMethod: bookController.createBook },
    { method: 'post', path: '/:id/rating', middlewares: [authMiddleware], controllerMethod: bookController.addRating },
    { method: 'put', path: '/:id', middlewares: [authMiddleware, multerMiddleware], controllerMethod: bookController.modifyBook },
    { method: 'delete', path: '/:id', middlewares: [authMiddleware], controllerMethod: bookController.deleteBook },
    { method: 'get', path: '/bestrating', middlewares: [], controllerMethod: bookController.getBestRatedBooks },
    { method: 'get', path: '/:id/ratings', middlewares: [], controllerMethod: bookController.getBookRatings },
    { method: 'get', path: '/:id', middlewares: [], controllerMethod: bookController.getOneBook },
    { method: 'get', path: '/', middlewares: [], controllerMethod: bookController.getAllBooks }
];

routes.forEach(route => createRoute(route, route.middlewares, route.controllerMethod));

module.exports = router;
