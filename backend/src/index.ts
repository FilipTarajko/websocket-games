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

const port = process.env.PORT ?? 3000;

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
};

let nextRoomId = 0;
const rooms: Room[] = [
  {
    id: 0,
    name: "lobby",
    users: [],
    owner: null,
    public: true,
  },
];

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.static(path.join(__dirname, "public")));
app.use("/", authRouter);

app.get("/rooms", (req, res) => {
  res.json(rooms.map((room) => ({ id: room.id, name: room.name, usersLenght: room.users.length, public: room.public })));
});

if (process.env.NODE_ENV === "development") {
  app.use(logger(":method :url"));
}

const server = http.createServer(app);

const webSocketServer = new WebSocket.Server({ noServer: true });

function onSocketError(err: any) {
  console.error(err);
}

function tryParseJson(jsonString: string) {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) { }
  return false;
}

function createRoom(webSocket: WebSocket, req: any, roomName: string) {
  const newRoom = { id: nextRoomId, name: roomName, users: [req], owner: req, public: true };
  nextRoomId += 1;
  rooms.push(newRoom);
  webSocket.send(`Created room: ${newRoom.name} (${newRoom.id})`);
  changeRoom(webSocket, req, newRoom.id);
  return newRoom;
}

function leaveRoom(webSocket: WebSocket, req: any) {
  const oldRoom = rooms.find((room) => room.users.includes(req));
  if (oldRoom) {
    oldRoom.users = oldRoom.users.filter((user) => user !== req);
    if (oldRoom.users.length === 0) {
      if (oldRoom.id == 0) {
        console.log("Can't delete lobby");
      } else {
        console.log("Room is empty, deleting...");
        rooms.splice(rooms.indexOf(oldRoom), 1);
      }
    } else {
      console.log("Room not empty, not deleting");
      if (oldRoom.owner === req) {
        console.log("Owner left, setting new owner");
        oldRoom.owner = oldRoom.users[0];
      }
    }
    webSocket.send(`Left room: ${oldRoom.name} (${oldRoom.id})`);
  }
}

function joinRoom(webSocket: WebSocket, req: any, roomId: number) {
  const newRoom = rooms.find((room) => room.id === roomId);
  if (!newRoom) {
    webSocket.send("Room not found.");
    return;
  }
  newRoom.users.push(req);
  webSocket.send(`{"roomName": "${newRoom.name}", "roomId": ${newRoom.id}}`);
}

function changeRoom(webSocket: WebSocket, req: any, newRoomId: number) {
  leaveRoom(webSocket, req);
  joinRoom(webSocket, req, newRoomId);
}

webSocketServer.on("connection", (webSocket, req: any) => {
  webSocket.send("Connection to server established.");
  joinRoom(webSocket, req, 0);

  webSocket.on("close", () => {
    console.log("Connection to client closed.");
    leaveRoom(webSocket, req);
  });

  webSocket.on("message", (messageToParse) => {
    const message = messageToParse.toString();
    const json = tryParseJson(message);
    if (json) {
      console.log("JSON: ", json);
      webSocket.send(`JSON: ${message}`);
      if (json?.action == "broadcast") {
        console.log("broadcasting!");
        webSocketServer.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
            client.send(req.user.username + " says: " + json.message);
          }
        });
      }
    } else {
      console.log("Received: ", message);
      webSocket.send(`Echo: ${message}`);
    }
  });
});

server.on("upgrade", function (req: any, socket: any, head: any) {
  socket.on("error", onSocketError);

  const cookies: { [key: string]: string } = {};
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    socket.destroy();
    return;
  }
  cookieHeader.split("; ").forEach((cookie: string) => {
    const [key, value] = cookie.split("=");
    cookies[key] = value;
  });

  jwt.verify(cookies?.token, process.env.JWT_SECRET!, function (err: any, decoded: any) {
    if (err || !decoded) {
      socket.destroy();
      return;
    }
    const username = decoded.username;
    const userId = decoded.userId;

    socket.emit("Authenticated as " + username + " (" + userId + ")");

    socket.removeListener("error", onSocketError);

    webSocketServer.handleUpgrade(req, socket, head, function (ws) {
      req.user = { username, userId };

      webSocketServer.emit("connection", ws, req);
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode.`);
});
