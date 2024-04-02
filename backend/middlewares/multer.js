const multer = require("multer");

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

//Configuration du stockage des fichiers uploadés
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images"); //Ls fichiers seront stochés dans le dossier "images"
  },
  filename: (req, file, callback) => {
    //Récupération de l'extension du fichier à partir de son type MIME
    const extension = MIME_TYPES[file.mimetype];
    const name = file.originalname.replace(/\.[^/.]+$/, "").split(" ").join("_"); //Replace les espaces par des underscores dans le nom d'origine
    callback(null, name + "_" + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");