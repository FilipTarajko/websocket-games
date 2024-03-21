import authRouter from "./auth";
import cookieParser from "cookie-parser";
var cors = require('cors')
import "dotenv/config";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import logger from "morgan";
import path from "path";
import WebSocket from "ws";
import { TicTacToeGame } from "./TicTacToe";
// @ts-ignore
import { DrawingGame } from "./Drawing";

const port = process.env.PORT ?? 3000;

const lobbyRoomId = 1

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

type Room = {
  id: number;
  name: string;
  users: any[];
  owner: any;
  public: boolean;
  game: null | TicTacToeGame | DrawingGame;
};

let nextRoomId = 2;
const rooms: Room[] = [
  {
    id: lobbyRoomId,
    name: "lobby",
    users: [],
    owner: null,
    public: true,
    game: null
  },
];

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.static(path.join(__dirname, "public")));
app.use("/", authRouter);

app.get("/rooms", (req, res) => {
  res.json(rooms.map((room) => ({ id: room.id, name: room.name, usersLenght: room.users.length, public: room.public, gameName: room.game?.gameName || "no game" })));
});

if (process.env.NODE_ENV === "development") {
  app.use(logger(":method :url"));
}

const server = http.createServer(app);

const webSocketServer = new WebSocket.Server({ noServer: true });

function onSocketError(err: any) {
  console.error(err);
}

function createRoom(webSocket: any, roomName: string) {
  const newRoom = { id: nextRoomId, name: roomName, users: [], owner: webSocket.user, public: true, game: null };
  nextRoomId += 1;
  rooms.push(newRoom);
  webSocket.send(`Created room: ${newRoom.name} (${newRoom.id})`);
  joinRoom(webSocket, newRoom.id);
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
            sendToAllPlayersInRoom(oldRoom, ["game/update", oldRoom.game])
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

function sendGameState(webSocket: any, room: any) {
  webSocket.send(JSON.stringify([`game/set`, room.game || { gameName: "" }]));
}

function generateRoomPublicData(room: any) {
  return { id: room.id, name: room.name, ownerName: room.owner?.username, users: room.users }
}

function joinRoom(webSocket: any, newRoomId: number) {
  leaveRoom(webSocket);
  const newRoom = rooms.find((room) => room.id === newRoomId);
  if (!newRoom) {
    sendControl(webSocket, 'rooms/not_found')
    return;
  }
  webSocket.roomId = newRoom.id;
  newRoom.users.push(webSocket.user);
  sendToAllPlayersInRoom(newRoom, ["rooms/update", generateRoomPublicData(newRoom)])
  sendControl(webSocket, "rooms/joined", generateRoomPublicData(newRoom))
  sendGameState(webSocket, newRoom)
}

function sendToAllPlayersInRoom(room: any, control: any) {
  webSocketServer.clients.forEach(function each(client) {
    // @ts-ignore
    if (client.readyState === WebSocket.OPEN && client.roomId === room.id) {
      client.send(JSON.stringify(control))
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
            if (control[1] === "tictactoe") {
              room.game = new TicTacToeGame()
              sendToAllPlayersInRoom(room, ["game/set", room.game])
            } else if (control[1] === "drawing") {
              room.game = new DrawingGame()
              sendToAllPlayersInRoom(room, ["game/set", room.game])
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
            sendToAllPlayersInRoom(room, ["game/update", room.game])
          }
          break;
        case 'place':
          if (room && room.game) {
            room.game.place(control[1]);
            if ("winner" in room.game && room.game.winner) {
              sendToAllPlayersInRoom(room, ["game/ended", room.game])
            } else {
              if (room.game.gameName === "Drawing") {
                sendToAllPlayersInRoom(room, ["game/updatePixel", { index: control[1].index, color: control[1].color }])
              } else {
                sendToAllPlayersInRoom(room, ["game/update", room.game])
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
  joinRoom(webSocket, lobbyRoomId);

  webSocket.on("close", () => {
    console.log("Connection to client closed.");
    leaveRoom(webSocket);
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
