const jwt = require('jsonwebtoken');

const dotenv = require('dotenv').config();

//Middleware d'authentification avec JWT
module.exports = (req, res, next) => {
  try {
    //Récupération du token dans le header authorization de la requête
    const token = req.headers.authorization.split(' ')[1];
    //Vérification et décodage du token en utilisant la clé secrète 
    const decodedToken = jwt.verify(token, `${process.env.SECRET_KEY}`);
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};