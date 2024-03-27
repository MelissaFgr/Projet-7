const express = require('express');
const Users = require('./models/users');

const router = express.Router();

router.use((req, res, next) => {
    console.log('middleware auth');
    next();
});

router.post('/api/auth/signup', (req, res) => {
    //Code à créer 
});
 
router.post('/api/auth/login', (req, res) => {
    //Code à créer 
});

module.exports = router;