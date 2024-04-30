const playerSchema = require("./player");
const uid = function () {
  let result = '';
  const characters = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
  let counter = 0;
  while (counter < 8) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    counter += 1;
  }
  return result;
}
class Room {
  constructor() {
    this.id = uid();
    this.occupancy = 2; // Nombre d'occupants de la room
    this.players = []; // Liste des joueurs
    this.isJoin = true; // Permet de rejoindre la room
    this.turn = {}; // Joueur actuel
    this.turnIndex = 0; // Index du joueur actuel
    this.hit = false;
    this.tableau = Array.from({ length: 10 }, () => Array(10).fill(0));
  }

  addPlayer(player) {
    if (this.players.length < this.occupancy) {
      this.players.push(player);
      return true; // Le joueur a été ajouté avec succès
    }
    return false; // La salle est pleine
  }

  nextTurn() {
    if(!this.hit){
      this.turnIndex = (this.turnIndex + 1) % this.players.length;
      this.turn = this.players[this.turnIndex];
    }
  }

  placeBoats(longueur) {
    const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
    const ligne = Math.floor(Math.random() * 10);
    const colonne = Math.floor(Math.random() * 10);

    if (direction === "horizontal" && colonne + longueur <= 10) {
      for (let i = 0; i < longueur; i++) {
        if (this.tableau[ligne][colonne + i] !== 0) {
          return this.placeBoats(longueur);
        }
      }
      for (let i = 0; i < longueur; i++) {
        this.tableau[ligne][colonne + i] = longueur;
      }
    } else if (direction === "vertical" && ligne + longueur <= 10) {
      for (let i = 0; i < longueur; i++) {
        if (this.tableau[ligne + i][colonne] !== 0) {
          return this.placeBoats(longueur);
        }
      }
      for (let i = 0; i < longueur; i++) {
        this.tableau[ligne + i][colonne] = longueur;
      }
    } else {
      return this.placeBoats(longueur);
    }
  }
}

module.exports = Room;
