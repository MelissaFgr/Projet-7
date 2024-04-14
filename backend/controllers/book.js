const Book = require('../models/books');
const sharp = require('../services/sharp-conf');
const fs = require('fs'); 
const averageRating = require('../services/averageRating');
const userAlreadyRated = require('../services/UserAlreadyRating');

//Contrôleur pour la création de livre
exports.createBook = async (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    const filename = await sharp.resizeImage(req.file);
    //Construction l'url complète de l'image (problème d'affichage d'image)
    const imageUrlOriginal = `${req.protocol}://${req.get('host')}/${filename}`;
    const imageUrl = imageUrlOriginal.replace(/\\/g,"/"); // Remplace tous les \ par des / afin de corriger le format de l'url et afficher l'image

    delete bookObject._id;
    delete bookObject._userID;

    //Création d'une instance du modèle avec les données de la requête
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId, //Ajout de l'ID utilisateur comme propriétaire du livre
      imageUrl,
    });

    await book.save();
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {
    next(error);
  }
};

//Contrôleur pour la modification du livre
exports.modifyBook = async (req, res, next) => {
  try {
    let filename;

    //Si un nouveau fichier d'image est fourni, redimensionnement de l'image et récupération du nom du fichier
    if (req.file) filename = await sharp.resizeImage(req.file);
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/${filename}`,
        }
      : { ...req.body };

    delete bookObject._userId;

    //Recherche du livre à modifier dans la base de données
    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    //Si un nouveau fichier d'image est fourni et que le livre a déjà une image, supprime l'ancienne
    if (req.file && book.imageUrl) {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, (err) => {
        if (err) console.log(err);
      });
    }

    //Met à jour l'entrée dans la base de données
    await Book.updateOne({ _id: req.params.id }, { ...bookObject });
    res.status(200).json({ message: 'Livre modifié !' });
  } catch (error) {
    next(error);
  }
};

//Contrôleur pour la suppression d'un livre
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    //Extraction du nom de l'image à supprimer
    const filename = book.imageUrl.split('/images/')[1];
    //Supprime le fichier d'image du serveur
    fs.unlink(`images/${filename}`, async () => {
      await Book.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: 'Livre supprimé !' });
    });
  } catch (error) {
    next(error);
  }
};

//Contrôleur pour récupérer un livre par son ID 
exports.getOneBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

//Contrôleur pour récupérer les notes d'un livre par son ID
exports.getBookRatings = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    res.status(200).json(book.ratings);
  } catch (error) {
    next(error);
  }
};

//Contrôler pour tous les livres
exports.getAllBooks = async (req, res, next) => {
  try {
    //Récupération de tous les livres de la base de données sans appliquer de filtre
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};


//Contrôleur pour récupérer les 3 livres les mieux notés
exports.getBestRatedBooks = async (req, res, next) => {
  try {
    //Récupération des 3 meilleurs livres depuis la base de données, triés par note moyenne décroissante
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

//Contrôleur pour ajouter une notre à un livre
exports.addRating = async (req, res, next) => {
  try {
    //Création d'un objet de note à partir des données de la requête
    const ratingObject = { ...req.body, grade: req.body.rating };
    delete ratingObject.rating;

    const book = await Book.findOne({ _id: req.params.id });
    const userRating = userAlreadyRated(req.body.userId, book.ratings);

    //Si l'utilisateur a déjà noté ce livre, envoi d'une réponse d'erreur avec le statut 422
    if (userRating) {
      return res.status(422).json({ message: 'Vous avez déjà noté ce livre' });
    }

    //Calcul de la nouvelle moyenne du livre avec la nouvelle note ajoutée
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
