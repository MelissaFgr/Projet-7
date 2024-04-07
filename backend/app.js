const express = require('express'); 
const mongoose = require('mongoose'); 
const dotenv = require('dotenv').config();


const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/auth');

// Connexion à la base de données MongoDB
mongoose
  .connect(
    `mongodb://localhost:27017/projet7`,
    { useNewUrlParser: true, useUnifiedTopology: true } // Options de connexion (nouvelle URL de connexion et détection des serveurs)
  )
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(() => console.log('Connexion à MongoDB échouée'));

const app = express();

// Middleware pour gérer les CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Autorise les requêtes de toutes les origines
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  ); // Autorise certains en-têtes dans les requêtes
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  ); // Autorise certains types de requêtes HTTP
  next();
});

app.use('/images', express.static('images')); // Jérémie
// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

app.use('/api/books', bookRoutes); 
app.use('/api/auth', userRoutes);

module.exports = app;