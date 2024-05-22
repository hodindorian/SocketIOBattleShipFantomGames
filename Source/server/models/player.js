class Player {
  constructor(nickname, nbPlayer, socketID, boats) {
    this.nickname = nickname;
    this.nbPlayer = nbPlayer;
    this.socketID = socketID;
    this.boats = boats;
  }
}

module.exports = Player;
