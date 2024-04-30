class Player {
  constructor(nickname, socketID, playerType) {
    this.nickname = nickname;
    this.socketID = socketID;
    this.boats = [];
  }
}

module.exports = Player;
