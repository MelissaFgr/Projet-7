const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config(); // Mobule pour utiliser une variable d'environnement 

const Users = require('../models/users');

// Fonction pour l'enregistrement d'un nouveau compte
exports.signup = (req, res, next) => {
  console.log('controleur auth');
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {const user = new User({
          email: req.body.email,
          password: hash,
        });
        user.save();
      })
};

// Fonction pour vérifier les infos de connexion et générer un jeton pour l'utilisation
exports.login = (req, res, next) => {User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
          }
                    res.status(200).json({
            userId: user._id,
            // Signature d'un jeton en y intégrant l'ID d'un utilisateur + secret key en variable d'environnement
            token: jwt.sign({ userId: user._id }, `${process.env.SECRET_KEY}`, {
              expiresIn: '1h',
            }),
          });
        })
    })
};