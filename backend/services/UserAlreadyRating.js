/* La fonction prend deux paramètres :
  - userId : l'identifiant de l'utilisateur dont on veut vérifier s'il a déjà noté.
  - ratings : un tableau contenant les notes attribuées par différents utilisateurs.*/

  function hasUserAlreadyRated(userId, ratings) {
    for (let i = 0; i < ratings.length; i++) {
        // Vérifie si l'identifiant de l'utilisateur correspond à celui passé en paramètre
        if (ratings[i].userId === userId) {
            return true;
        }
    }
    return false;
}

module.exports = hasUserAlreadyRated;