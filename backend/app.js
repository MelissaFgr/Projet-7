const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const booksRouter = require('./routes/books');
const userRouter = require('./routes/auth');

//Connexion à la base de données
mongoose.connect('mongodb://localhost:27017/projet7', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
   console.log("Connexion à la base réussie");
})
.catch(err => {
   console.log('Connexion à la base impossible', err);
   process.exit();
});

const app = express();

//Header pour éviter les erreurs CORS
app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
 });

//Permet de lire le body au format JSON
app.use(bodyParser.json());

app.use('/api/books', booksRouter);
app.use('/api/auth', userRouter);


module.exports = app;