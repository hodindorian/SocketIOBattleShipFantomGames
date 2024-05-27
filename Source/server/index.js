// importing modules
const express = require("express");
const http = require("http");

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const Room = require("./models/room");
const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
});

// middle ware
app.use(express.json());

const rooms = [];

io.on("connection", (socket) => {
  console.log("connected!");

  socket.on("createRoom", async ({ nickname }) => {
    console.log(nickname);
    try {
      // room is created
      let room = new Room();
      let player = {
        socketID: socket.id,
        nickname: nickname,
        nbPlayer: 1,
        boats: [],
      };
      room.addPlayer(player);
      room.turn = player;
      socket.join(room.id);
      // io -> send data to everyone
      // socket -> sending data to yourself
      io.to(room.id).emit("createRoomSuccess", room);
      rooms.push(room);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("joinRoom", async ({ nickname, roomId }) => {
    console.log("JoinRoom");
    console.log(nickname);

    try {
      const room = rooms.find((room) => room.id === roomId.toString());
      if (room.isJoin) {
        let player = {
          socketID: socket.id,
          nickname: nickname,
          nbPlayer: 2,
          boats: [],
        };
        if(room.players[0].nickname === nickname){
          socket.emit(
            "errorOccurred",
            "Vous ne pouvez pas vous affronter vous même  !"
          );
        }else{
          socket.join(roomId);
          room.addPlayer(player);
          room.isJoin = false;
          io.to(roomId).emit("joinRoomSuccess", room);
          io.to(roomId).emit("updatePlayers", room.players);
          io.to(roomId).emit("updateRoom", room);
        }
      } else {
        socket.emit(
          "errorOccurred",
          "Cette partie est déjà en cours !"
        );
      }
    } catch (error) {
      if(error instanceof TypeError) {
        socket.emit(
          "errorOccurred",
          "Code de room introuvable !"
        );
      }else{
        console.log(error);
      }
    }
  });

  socket.on("tap", async ({ index, roomId }) => {
    console.log("tap");

    try {
      const room = rooms.find((room) => room.id === roomId);
      let actualCase = [(Math.floor(index / 10)), (index % 10)];
      let hit = '0';
      let actualPlayer = '';
      if (room.turnIndex === 0) {
        actualPlayer = room.players[0].nbPlayer;
        for (let boats of room.players[1].boats) {
          for (let boat1 of boats){
            for (let boatFinal of boat1){
              if (boatFinal.every((val, idx) => val === actualCase[idx])) {
                hit = 'X';
                break;
            }
            }

          }
        }
        room.turn = room.players[1];
        room.turnIndex = 1;
      } else {
        actualPlayer = room.players[1].nbPlayer;
        for (let boats of room.players[0].boats) {
          for (let boat1 of boats){
            for (let boatFinal of boat1){
              if (boatFinal.every((val, idx) => val === actualCase[idx])) {
                hit = 'X';
                break;
              }
            }

          }
        }
        room.turn = room.players[0];
        room.turnIndex = 0;
      }
      let boats1 = room.players[0].boats;
      let boats2 = room.players[1].boats;

      io.to(roomId).emit("tapped", {
        index,
        room,
        hit,
        actualPlayer,
        boats1,
        boats2,
      });
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("winner", async ({ winnerSocketId, roomId }) => {
    console.log("winner");
    try {
      const room = rooms.find((room) => room.id === roomId);
      let player = room.players.find((p) => p.socketID === winnerSocketId);
      io.to(roomId).emit("endGame", player);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("getBoats", async ({ player, roomId }) => {
    try {
      console.log("getBoats");
      const room = rooms.find((room) => room.id === roomId);
      let player1 = room.players.find((p1) => p1.nickname === player );
      io.to(roomId).emit("getBoats", player, player1.boats);
    } catch (e) {
      if(!(e instanceof TypeError)){
        console.log(e);
      }
    }
  });

});



server.listen(port, "0.0.0.0", () => {
  console.log(`Server started and running on port ${port}`);
});
