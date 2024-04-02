const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/users');
const dotenv = require('dotenv').config();

//Contrôleur pour l'inscription d'un nouvel utilisateur
exports.signup = (req, res, next) => {
  //Hachage du mdp
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

//Controleur pour le login de l'utilisateur
exports.login = (req, res, next) => {
  //Recherche l'utilisateur dans la base de données par son email
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }
      //Comparaison mdp fourni avec le hash de l'utilisateur
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
          }
          //Génération d'un token 
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, `${process.env.SECRET_KEY}`, { //Génération du jeton avec l'ID de l'utilisation et la clé secrète présente dans les variables d'environnement
              expiresIn: '12h',
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};