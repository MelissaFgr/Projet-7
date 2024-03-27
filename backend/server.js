const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/projet7', (err) =>{
   if (err) {
      throw err;
   }
});

const booksRouter = require('./routes/books');
const userRouter = require('./routes/auth');

const app = express();

app.use('/api/books', booksRouter);

app.use('/api/auth', userRouter);

module.exports = app;