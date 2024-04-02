const http = require('http');

const app = require('./app');

// Fonction pour normaliser le port
const normalizePort = (val) => {
  const port = parseInt(val, 10); // Conversion de la valeur du port en un entier

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// Récupération du port à partir des variables d'environnement ou utilisation du port 4000 par défaut
const port = normalizePort(process.env.PORT || '4000');

app.set('port', port);

// Fonction pour gérer les erreurs de démarrage du serveur
const errorHandler = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();

  const bind =
    typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; // Formatte l'adresse pour l'affichage

  switch (error.code) { // Gestion des différents types d'erreurs
    case 'EACCES': // Erreur d'autorisation
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE': // Erreur de port déjà utilisé
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Création du serveur HTTP en utilisant l'application Express
const server = http.createServer(app);

server.on('error', errorHandler);

// Écoute des événements de démarrage du serveur
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);