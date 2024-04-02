/* La fonction prend deux paramètres :
- book : l'objet représentant le livre, contenant un tableau de notes (ratings) et éventuellement la note moyenne actuelle (averageRating).
- ratingObject : un objet contenant la nouvelle note attribuée au livre.*/

function updateAverageRating(book, ratingObject) {
    const n = book.ratings.length;

    //Moyenne actuelle des notes du livre, si elle existe ; sinon, par défaut, elle est considérée comme 0
    const currentAverage = book.averageRating || 0;
    const newGrade = ratingObject.grade;
    
    //Calcul de la nouvelle moyenne en tenant compte de la nouvelle note
    const updatedAverage = (currentAverage * n + newGrade) / (n + 1);
    
    return Math.round(updatedAverage * 10) / 10;
}

module.exports = updateAverageRating;
