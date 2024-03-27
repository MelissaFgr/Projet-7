const jwt = require('jsonwebtoken');

// Middlaware d'authentification, vérification du token
module.exports = (req, res, next) => {
    // Problème ici ou dans la requête 
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
        res.status(401).json({ message: 'Authentification échouée' });
    }
};