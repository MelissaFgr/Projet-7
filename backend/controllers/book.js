const Book = require('../models/books');
const sharp = require('../services/sharp-conf');
const fs = require('fs'); 
const averageRating = require('../services/averageRating');
const userAlreadyRated = require('../services/UserAlreadyRating');

exports.createBook = async (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    const filename = await sharp.resizeImage(req.file);
    const imageUrl = `${req.protocol}://${req.get('host')}/${filename}`;
    delete bookObject._id;
    delete bookObject._userID;

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl,
    });

    await book.save();
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {
    next(error);
  }
};

exports.modifyBook = async (req, res, next) => {
  try {
    let filename;

    if (req.file) filename = await sharp.resizeImage(req.file);
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/${filename}`,
        }
      : { ...req.body };

    delete bookObject._userId;

    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    if (req.file && book.imageUrl) {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, (err) => {
        if (err) console.log(err);
      });
    }

    await Book.updateOne({ _id: req.params.id }, { ...bookObject });
    res.status(200).json({ message: 'Livre modifié !' });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, async () => {
      await Book.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: 'Livre supprimé !' });
    });
  } catch (error) {
    next(error);
  }
};

exports.getOneBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

exports.getBookRatings = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    res.status(200).json(book.ratings);
  } catch (error) {
    next(error);
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

exports.getBestRatedBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

exports.addRating = async (req, res, next) => {
  try {
    const ratingObject = { ...req.body, grade: req.body.rating };
    delete ratingObject.rating;

    const book = await Book.findOne({ _id: req.params.id });
    const userRating = userAlreadyRated(req.body.userId, book.ratings);

    if (userRating) {
      return res.status(422).json({ message: 'Vous avez déjà noté ce livre' });
    }

    const averageRatingValue = averageRating(book, ratingObject);
    await Book.updateOne(
      { _id: req.params.id },
      { $push: { ratings: ratingObject }, averageRating: averageRatingValue }
    );

    const updatedBook = await Book.findOne({ _id: req.params.id });
    res.status(200).json(updatedBook);
  } catch (error) {
    next(error);
  }
};
