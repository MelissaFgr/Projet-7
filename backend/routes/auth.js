const express = require('express');
const userController = require('../controllers/auth');

const auth = require('../middlewares/auth');

const router = express.Router();

router.use((req, res, next) => {
    console.log('Routes Auth');    
});

// Appelle la route en y intégrant le middleware d'authentification et le controleur (problème)
router.post('/signup', auth, (userController.signup));
 
router.post('/login', auth, (userController.login));

module.exports = router;