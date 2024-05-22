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
      player.boats.push(this.placeBoats());
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

  placeBoats() {
    const boatLengths = [5, 4, 3, 2, 1, 1];
    const boardSize = 10;
    const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(false)); // Initialisation de la grille vide
    const boats = [];

    for (const length of boatLengths) {
        let boatCoordinates;

        do {
            boatCoordinates = this.generateRandomBoat(boardSize, length);
        } while (!this.isValidPlacement(board, boatCoordinates));

        boats.push(boatCoordinates);
        this.markOccupiedCells(board, boatCoordinates);
    }

    return boats;
  }

  generateRandomBoat(boardSize, length) {
      const startX = Math.floor(Math.random() * boardSize);
      const startY = Math.floor(Math.random() * boardSize);
      const isHorizontal = Math.random() < 0.5;
      const boatCoordinates = [];

      if (isHorizontal) {
          for (let i = 0; i < length; i++) {
              const x = startX + i;
              const y = startY;
              if (x < boardSize) {
                  boatCoordinates.push([x, y]);
              } else {
                  return this.generateRandomBoat(boardSize, length);
              }
          }
      } else {
          for (let i = 0; i < length; i++) {
              const x = startX;
              const y = startY + i;
              if (y < boardSize) {
                  boatCoordinates.push([x, y]);
              } else {
                  return this.generateRandomBoat(boardSize, length);
              }
          }
      }
      return boatCoordinates;
  }

  isValidPlacement(board, boatCoordinates) {
      for (const [x, y] of boatCoordinates) {
          if (board[x][y] || !this.isCellAndSurroundingsFree(board, x, y)) {
              return false;
          }
      }
      return true;
  }

  isCellAndSurroundingsFree(board, x, y) {
      const directions = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 0], [0, 1],
          [1, -1], [1, 0], [1, 1]
      ];

      for (const [dx, dy] of directions) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 0 && newX < board.length && newY >= 0 && newY < board.length) {
              if (board[newX][newY]) {
                  return false;
              }
          }
      }

      return true;
  }

  markOccupiedCells(board, boatCoordinates) {
      for (const [x, y] of boatCoordinates) {
          board[x][y] = true;
      }
  }
}

module.exports = Room;
