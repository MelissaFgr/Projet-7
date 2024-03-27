const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    userId: String,
    title: String,
    author: String,
    imageURL: String,
    year: Number,
    genre: String,
    ratings: [
       {
          userld:String,
          grade: Number
       }
    ],
    averageRating: Number
 });

 const Book = mongoose.model('Book', bookSchema);

 module.exports = Book;