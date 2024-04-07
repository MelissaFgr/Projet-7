// Importation des modules requis
const sharp = require('sharp'); // Module Sharp pour le traitement d'images
const path = require('path'); // Module Path pour la manipulation des chemins de fichiers
const fs = require('fs'); // Module fs pour les opérations de fichiers

// Définition des types MIME pour les extensions d'images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

// Fonction asynchrone pour redimensionner une image
async function resizeImage(file) {
  const absolutePath = path.resolve(file.path);

  // Obtention de l'extension du fichier à partir du type MIME
  const extension = MIME_TYPES[file.mimetype];

  // Définition du chemin de destination pour l'image redimensionnée en format .avif
  const destinationPath = absolutePath.replace(`.${extension}`, '.avif');

  sharp.cache(false); // indiquer à Jérémie
  // Utilisation de Sharp pour redimensionner l'image et la convertir en format .avif
  await sharp(absolutePath)
    .resize({ width: 800, fit: 'contain' })
    .avif()
    .toFile(destinationPath);

  // Suppression de l'image originale après redimensionnement
  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.log(err);
    }
  });

  // Retourne le chemin du fichier redimensionné avec l'extension .avif
  return file.path.replace(`.${extension}`, '.avif');
}

// Exportation de la fonction resizeImage pour être utilisée dans d'autres modules
module.exports = { resizeImage };