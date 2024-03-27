const express = require('express');
const Books = require('../models/books');

const router = express.Router();

const multer = require('multer');
const { createReadStream } = require('fs');

// Configuration de Multer pour gérer le téléchargement de l'image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Dossier où les images seront stockées
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Renommage du fichier avec l'ajout d'un timestamp
    }
});

const upload = multer({ storage: storage });

router.use((req, res, next) => {
    console.log('middleware books');
    next();
});

// Permet la récup de tous les livres
router.get('/', async(req, res) => {
    try {
        const books = await Books.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Erreur de la récupération de l\'élément' });
    }
});

// Permet la récup d'un livre selon son ID 
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

// Trie des livres par note moyenne et récupération des 3 mieux notés 
router.get('/bestrating', async(req, res) => {
    try {
        const books = await Books.find().sort({averageRating: -1}).limit(3);

        res.status(200).json(books);        
    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'Erreur de la récupération de l\'élément'});
    }
});

// Ajoute un livre 
router.post('/', upload.single('image'), async(req, res) => {
    //A faire
});
 
// Ajoute une notation à un livre 
router.post('/:bookId/rating/:userId', async(req, res) => {
    try {
        const { bookId, userId } = req.params;
        const { rating } = req.body;

        // Vérifie si la note est valide
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
        }

        // Cherche le livre dans la base de données
        const books = await Books.findById(bookId);

        if (!books) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        // Vérifie si l'utilisateur a déjà noté ce livre
        const existingRating = books.ratings.find(entry => entry.userId === userId);

        if (existingRating) {
            return res.status(400).json({ message: 'L\'utilisateur a déjà noté ce livre' });
        }

        // Ajoute la note dans le tableau "rating"
        books.ratings.push({ userId, rating });

        // Mettre à jour la note moyenne "averageRating"
        const totalRatings = books.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        books.averageRating = totalRatings / books.ratings.length;

        await books.save();

        res.status(200).json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la définition de la note pour le livre' });
    }
});
 
// Mettre à jour les infos d'un livre
router.put('/:id', upload.single('image'), async(req, res) => {
    try {
        const { id } = req.params;
        const { title, author, year, genre } = req.body;

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
        
            book.title = title;
            book.author = author;
            book.year = year;
            book.genre = genre;
        }

        else {
            
            book.title = title;
            book.author = author;
            book.year = year;
            book.genre = genre;
        }

        book = await book.save();

        res.status(200).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du livre' });
    }
});
 
// Supprime un livre et l'image associée
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