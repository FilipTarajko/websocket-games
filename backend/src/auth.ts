import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "./middleware";
const prisma = new PrismaClient();

const router = Router();

router.get("/me", checkAuth, async (req: any, res) => {
  const tokenContent = jwt.decode(req.cookies.token);
  if (tokenContent != null && typeof tokenContent == "object" && "username" in tokenContent) {
    const user = await prisma.user.findUnique({ where: { username: tokenContent.username } });
    res.send(`You (${req.username} - ${req.userId}) have access! Your cookies: ${JSON.stringify(req.cookies)}\nYour data: ${JSON.stringify(user)}`);
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Your cookie has been removed!");
});

router.post("/login", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send("Username and password are required");
    return;
  }
  const user = await prisma.user.findUnique({ where: { username: req.body.username } });
  if (!user) {
    res.status(401).send("User not found");
    return;
  }
  bcrypt.compare(req.body.password, user.password, function (err, result) {
    if (err) {
      res.status(500).send("Error while trying to log in");
      return;
    }

    if (!result) {
      res.status(401).send("Incorrect password");
      return;
    }

    jwt.sign({ username: user.username, userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" }, (err, token) => {
      console.log(err);
      console.log(token);
      if (err) {
        res.status(500).send("Error while trying to log in");
        return;
      }
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: process.env.NODE_ENV !== "development",
        secure: process.env.NODE_ENV !== "development",
      });
      res.send("You were given a cookie!");
    });
  });
});

router.post("/register", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send("Username and password are required");
    return;
  }
  if (await prisma.user.findUnique({ where: { username: req.body.username } })) {
    res.status(400).send("Username already in use");
    return;
  }

  bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS ?? "10"), function (err, salt) {
    if (err) {
      res.status(500).send("Error while trying to register");
      return;
    }
    bcrypt.hash(req.body.password, salt, async function (err, hash) {
      console.log(`Password: ${req.body.password}`);
      console.log(`Hashed password: ${JSON.stringify(hash)}`);
      if (err) {
        res.status(500).send("Error while trying to register");
        return;
      }
      await prisma.user.create({
        data: {
          username: req.body.username,
          password: hash,
        },
      });
    });
  });
  res.status(201).send("Account created");
});

export default router;
