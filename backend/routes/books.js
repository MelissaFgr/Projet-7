const express = require('express');
const Books = require('../models/books');

const router = express.Router();

const multer = require('multer');
const { createReadStream } = require('fs');
const { TesseractWorker } = require('tesseract.js');
// Configuration de Multer pour gérer le téléchargement de l'image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Dossier où les images seront stockées
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Nom du fichier : timestamp-originalname
    }
});

const upload = multer({ storage: storage });

router.use((req, res, next) => {
    console.log('middleware books');
    next();
});

router.get('/', async(req, res) => {
    try {
        const books = await Books.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Erreur de la récupération de l\'élément' });
    }
});
 
router.get('/:id', async(req, res) => {
    try {
        const bookID = req.params.id;
        const element = await Books.findById(id);

        if(!element) {
            return res.status(404).json({message: 'Aucun élément trouvé'})
        }

    res.status(200).json(element);
    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'Erreur de la récupération de l\'élément'});
    }
});
 
router.get('/bestrating', async(req, res) => {
    try {
        const books = await Books.find().sort({averageRating: -1}).limit(3);

        res.status(200).json(books);        
    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'Erreur de la récupération de l\'élément'});
    }
});

router.post('/', upload.single('image'), async(req, res) => {
    try {
        // Analyser le livre à partir de l'image
        const worker = new TesseractWorker();
        const text = await new Promise((resolve, reject) => {
            worker.recognize(createReadStream(req.file.path), 'fra', { tessjs_create_pdf: '1' }, (err, data) => {
                if (err) reject(err);
                resolve(data.text);
            });
        });

        // Créer un nouveau livre avec les données extraites
        const newBook = new Books({
            title: req.body.title,
            author: req.body.author,
            imageUrl: req.file.path // Chemin de l'image téléchargée            
        });

        // Enregistrer le nouveau livre dans la base de données
        const savedBook = await newBook.save();

        res.status(201).json(savedBook); // Renvoyer le livre enregistré en réponse
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du livre' });
    }
});
 
router.post('/:bookId/rating/:userId', async(req, res) => {
    try {
        const { bookId, userId } = req.params;
        const { rating } = req.body;

        // Vérifier si la note est valide
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
        }

        // Rechercher le livre dans la base de données
        const books = await Books.findById(bookId);

        if (!books) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        // Vérifier si l'utilisateur a déjà noté ce livre
        const existingRating = books.ratings.find(entry => entry.userId === userId);

        if (existingRating) {
            return res.status(400).json({ message: 'L\'utilisateur a déjà noté ce livre' });
        }

        // Ajouter la note dans le tableau "rating"
        books.ratings.push({ userId, rating });

        // Mettre à jour la note moyenne "averageRating"
        const totalRatings = books.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        books.averageRating = totalRatings / books.ratings.length;

        // Enregistrer les modifications dans la base de données
        await books.save();

        // Renvoyer le livre mis à jour en réponse
        res.status(200).json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la définition de la note pour le livre' });
    }
});
 
router.put('/:id', upload.single('image'), async(req, res) => {
    try {
        const { id } = req.params;
        const { title, author, year, genre } = req.body;

        // Rechercher le livre dans la base de données
        let book = await Books.findById(id);

        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        // Si une image est téléchargée, mettre à jour l'ImageUrl
        if (req.file) {
            const worker = new TesseractWorker();
            const text = await new Promise((resolve, reject) => {
            worker.recognize(createReadStream(req.file.path), 'fra', { tessjs_create_pdf: '1' }, (err, data) => {
                if (err) reject(err);
                resolve(data.text);                
            });
        });
        
            // Mettre à jour les informations sur le livre
            book.title = title;
            book.author = author;
            book.year = year;
            book.genre = genre;
        }

        // Si le livre est fourni directement dans le corps de la requête, mettre à jour le texte du livre
        else {
            
            // Mettre à jour les informations sur le livre
            book.title = title;
            book.author = author;
            book.year = year;
            book.genre = genre;
        }

        // Enregistrer les modifications dans la base de données
        book = await book.save();

        // Renvoyer le livre mis à jour en réponse
        res.status(200).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du livre' });
    }
});
 
router.delete('/:id', async(req, res) => {
    try {
        const id = req.params.id;

        const books = await Books.findById(id);

        if (!books) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        if (books.imageURL) {
            fs.unlinkSync(books.imageURL);
        }

        await Books.findByIdAndRemove(id);

        res.status(200).json({ message: 'Livre supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du livre' });
    }
});

module.exports = router;