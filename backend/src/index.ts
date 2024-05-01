import authRouter from "./auth";
import cookieParser from "cookie-parser";
var cors = require('cors')
import "dotenv/config";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import logger from "morgan";
import WebSocket from "ws";
import { TicTacToeGame } from "./games/tictactoe";
import { DrawingGame } from "./games/drawing";
import { RockPaperScissorsGame } from "./games/rockPaperScissors";

const port = process.env.PORT;

const lobbyRoomId = 1

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  preflightContinue: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionSuccessStatus: 200
}));

type Room = {
  id: number;
  name: string;
  users: any[];
  owner: any;
  password: string;
  game: null | TicTacToeGame | DrawingGame | RockPaperScissorsGame;
};

let nextRoomId = 2;
const rooms: Room[] = [
  {
    id: lobbyRoomId,
    name: "lobby",
    users: [],
    owner: null,
    password: "",
    game: null
  },
];

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/", authRouter);

if (process.env.NODE_ENV === "development") {
  app.use(logger(":method :url"));
}

const server = http.createServer(app);

const webSocketServer = new WebSocket.Server({ noServer: true });

function onSocketError(err: any) {
  console.error(err);
}

function createRoom(webSocket: any, roomInitData: any) {
  const new_room_name = roomInitData.name || (webSocket.user.username + "'s room");
  const new_room_name_after_trim = new_room_name.trim().slice(0, 30);
  console.log(new_room_name_after_trim)
  const newRoom = {
    id: nextRoomId,
    name: new_room_name_after_trim,
    users: [],
    owner: webSocket.user,
    password: roomInitData.password,
    game: null
  };
  nextRoomId += 1;
  rooms.push(newRoom);
  webSocket.send(`Created room: ${newRoom.name} (${newRoom.id})`);
  joinRoom(webSocket, { newRoomId: newRoom.id, password: newRoom.password });
  return newRoom;
}

function tryParseControl(string: string) {
  try {
    const o = JSON.parse(string)
    if (o && typeof o === 'object' && o.length == 2) {
      return o
    }
  } catch (e) {
    return false
  }
  return false
}

function leaveRoom(webSocket: any) {
  const oldRoom = rooms.find((room) => room.users.includes(webSocket.user));
  if (oldRoom) {
    oldRoom.users = oldRoom.users.filter((user) => user != webSocket.user);
    if (oldRoom.users.length === 0) {
      if (oldRoom.id == lobbyRoomId) {
        console.log("Can't delete lobby");
      } else {
        console.log("Room is empty, deleting...");
        rooms.splice(rooms.indexOf(oldRoom), 1);
      }
    } else {
      console.log("Room not empty, not deleting");
      if (oldRoom.owner === webSocket.user) {
        console.log("Owner left, setting new owner");
        oldRoom.owner = oldRoom.users[0];
      }
      if (oldRoom.game && "playerSpots" in oldRoom.game) {
        for (let i = 0; i < oldRoom.game.playerSpots.length; i++) {
          if (oldRoom.game.playerSpots[i].player?.id == webSocket.user.id) {
            oldRoom.game.playerSpots[i].player = null;
            updateDataForGameClients(oldRoom, "game/update")
          }
        }
      }
    }
    sendToAllPlayersInRoom(oldRoom, ["rooms/update", generateRoomPublicData(oldRoom)])
    webSocket.send(`Left room: ${oldRoom.name} (${oldRoom.id})`);
  }
}

function sendControl(webSocket: WebSocket, name: any, data: any = {}) {
  webSocket.send(JSON.stringify([name, data]));
}

function generateRoomPublicData(room: any) {
  return { id: room.id, name: room.name, ownerName: room.owner?.username, users: room.users }
}

function joinRoom(webSocket: any, joinData: any) {
  const newRoom = rooms.find((room) => room.id === joinData.newRoomId);
  if (!newRoom) {
    sendControl(webSocket, 'rooms/not_found')
    return;
  }
  if (newRoom.password && newRoom.password != joinData.password) {
    sendControl(webSocket, 'rooms/wrong_password', { roomId: newRoom.id })
    return;
  }
  leaveRoom(webSocket);
  webSocket.roomId = newRoom.id;
  newRoom.users.push(webSocket.user);
  sendToAllPlayersInRoom(newRoom, ["rooms/update", generateRoomPublicData(newRoom)])
  sendControl(webSocket, "rooms/joined", generateRoomPublicData(newRoom))
  // sendGameState(webSocket, newRoom)
  // webSocket.send(JSON.stringify([`game/set`, room.game || { gameName: "" }]));
  sendPreparedGameState(webSocket, newRoom, "game/set");
  updateRoomList()
}

function sendToAllPlayersInRoom(room: any, control: any) {
  webSocketServer.clients.forEach(function each(client) {
    // @ts-ignore
    if (client.readyState === WebSocket.OPEN && client.roomId === room.id) {
      client.send(JSON.stringify(control))
    }
  })
}

function updateRoomList() {
  webSocketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(["rooms/updateList", rooms.map((room) => ({ id: room.id, name: room.name, usersLenght: room.users.length, hasPassword: room.password.length > 0, gameName: room.game?.gameName || "no game" }))]))
    }
  })

}

function sendPreparedGameState(webSocket: any, room: any, controlName: string) {
  let preparedGameData = structuredClone(room.game)
  if (preparedGameData && "playerSpots" in preparedGameData && "strategic_data" in preparedGameData.playerSpots[0]) {
    for (let i = 0; i < preparedGameData.playerSpots.length; i++) {
      // @ts-ignore
      if (preparedGameData?.playerSpots[i].player?.id == webSocket.user.id) {
        // @ts-ignore
        preparedGameData.your_strategic_data = preparedGameData.playerSpots[i].strategic_data;
      }
      delete preparedGameData.playerSpots[i].strategic_data;
    }
  }
  webSocket.send(JSON.stringify([controlName, preparedGameData || { gameName: "" }]))
}

function updateDataForGameClients(room: Room, controlName: string) {
  webSocketServer.clients.forEach(function each(client) {
    // @ts-ignore
    if (client.readyState === WebSocket.OPEN && client.roomId === room.id) {
      sendPreparedGameState(client, room, controlName);
    }
  })
}

function interpretControl(control: any, webSocket: any) {
  let room = rooms.find((room) => room.users.includes(webSocket.user))
  const controlParts = control[0].split('/');
  switch (controlParts[0]) {
    case 'rooms':
      switch (controlParts[1]) {
        case 'create':
          createRoom(webSocket, control[1]);
          break;
        case 'join':
          joinRoom(webSocket, control[1]);
          break;
        case 'leave':
          leaveRoom(webSocket);
          updateRoomList()
          break;
        case 'say':
          const roomId = rooms.find((room) => room.users.includes(webSocket.user))?.id;
          console.log(roomId)
          webSocketServer.clients.forEach(function each(client) {
            // @ts-ignore
            if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
              client.send(JSON.stringify(['rooms/said', { author: webSocket.user, message: control[1] }]))
            }
          })
          break;
        case 'setGame':
          if (room && (room.owner === webSocket.user)) {
            let playerSlotsPlayers: any = []
            if (room.game && "playerSpots" in room.game) {
              playerSlotsPlayers = room.game.playerSpots.map((spot) => spot.player)
            }
            let gameFound = true;
            let gameName = control[1].name;
            if (gameName === "tictactoe") {
              room.game = new TicTacToeGame()
            } else if (gameName === "drawing") {
              room.game = new DrawingGame()
            } else if (gameName === "rockpaperscissors") {
              room.game = new RockPaperScissorsGame()
            } else {
              gameFound = false;
            }
            if (gameFound) {
              if (room.game && "playerSpots" in room.game && control[1].keepPlayersInSpots) {
                room.game.playerSpots = room.game.playerSpots.map((spot: any, index: any) => ({ ...spot, player: playerSlotsPlayers[index] }))
              }
              updateDataForGameClients(room, "game/set")
              updateRoomList()
            }
          }
          break;
        default:
          sendControl(webSocket, 'error', { message: `Unknown 'rooms' control: ${control}` })
          break;
      }
      break;
    case 'game':
      switch (controlParts[1]) {
        case 'takeSpot':
          if (room && room.game && "takeSpot" in room.game) {
            room.game.takeSpot(control[1], webSocket.user);
            updateDataForGameClients(room, "game/update")
          }
          break;
        case 'leaveSpot':
          if (room && room.game && "leaveSpot" in room.game) {
            room.game.leaveSpot(webSocket.user);
            updateDataForGameClients(room, "game/update")
          }
          break;
        case 'place':
          if (room && room.game) {
            // @ts-ignore
            if (room.game.place(control[1], webSocket.user)) {
              if ("winner" in room.game && room.game.winner) {
                updateDataForGameClients(room, "game/ended")
              } else {
                if (room.game.gameName === "Drawing") {
                  sendToAllPlayersInRoom(room, ["game/updatePixel", { index: control[1].index, color: control[1].color }])
                } else {
                  updateDataForGameClients(room, "game/update")
                }
              }
            }
          }
          break;
      }
      break;
    default:
      sendControl(webSocket, 'error', { message: `Unknown ??? control: ${control[0]}, ${control[1]}` })
      break;

  }
}

webSocketServer.on("connection", (webSocket: any, req: any) => {

  const cookies: { [key: string]: string } = {};
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    webSocket.terminate();
    return;
  }
  cookieHeader.split("; ").forEach((cookie: string) => {
    const [key, value] = cookie.split("=");
    cookies[key] = value;
  });

  jwt.verify(cookies?.token, process.env.JWT_SECRET!, function (err: any, decoded: any) {
    if (err || !decoded) {
      webSocket.terminate();
      return;
    }
    const username = decoded.username;
    const id = decoded.userId;
    webSocket.user = { username, id }
    webSocket.emit("Authenticated as " + username + " (" + id + ")");
    webSocket.removeListener("error", onSocketError);
  });

  webSocket.send("Connection to server established.");
  joinRoom(webSocket, { newRoomId: lobbyRoomId, password: "" });

  webSocket.on("close", () => {
    console.log("Connection to client closed.");
    leaveRoom(webSocket);
    updateRoomList()
  });

  webSocket.on("message", (messageToParse: any) => {
    const message = messageToParse.toString();
    const control = tryParseControl(message)
    if (control) {
      console.log(`${control[0]}: ${JSON.stringify(control[1])}`)
      interpretControl(control, webSocket)
    } else {
      console.log("Received: ", message);
      webSocket.send(`Echo: ${message}`);
    }
  });
});

server.on("upgrade", function (req: any, socket: any, head: any) {
  webSocketServer.handleUpgrade(req, socket, head, function (ws) {
    webSocketServer.emit("connection", ws, req);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode.`);
});
