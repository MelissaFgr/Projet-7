const http = require('http');
const app = require('./app');

// Pour normaliser un port (éviter les erreurs de mal configuré ou déjà utilisé)
const normalizePort = (val) => {
   const port = parseInt(val, 10);

   if (isNaN(port)) {
       return val;
   }
   if (port >= 0) {
       return port;
   }
   return false;
};

const port = normalizePort(process.env.PORT || "4000");
app.set("port", port);

const server = http.createServer(app);

// log de l'écoute du serveur
server.on("listening", () => {
    const address = server.address();
    const bind =
        typeof address === "string" ? "pipe " + address : "port " + port;
    console.log("Serveur en ecoute sur " + bind);
});

server.listen(port);