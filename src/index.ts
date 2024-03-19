import authRouter from "./auth";
import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import logger from "morgan";
import path from "path";
import WebSocket from "ws";

const port = process.env.PORT ?? 3000;

const app = express();

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.static(path.join(__dirname, "public")));
app.use("/", authRouter);

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
  } catch (e) {}
  return false;
}
webSocketServer.on("connection", (webSocket, req: any) => {
  webSocket.send("Connection to server established.");

  webSocket.on("close", () => {
    console.log("Connection to client closed.");
  });

  webSocket.on("message", (messageToParse) => {
    const message = messageToParse.toString();
    const json = tryParseJson(message);
    if (json) {
      console.log("JSON: ", json);
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
    }
    webSocket.send(`Echo: ${message}`);
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
