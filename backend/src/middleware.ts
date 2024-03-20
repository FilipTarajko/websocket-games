import jwt from "jsonwebtoken";

export function checkAuth(req: any, res: any, next: any) {
  jwt.verify(req.cookies.token, process.env.JWT_SECRET!, function (err: any, decoded: any) {
    if (err) {
      res.status(401).send("Unauthorized");
      return;
    }
    if (!decoded) {
      res.status(401).send("Unauthorized");
      return;
    }
    req.username = decoded.username;
    req.userId = decoded.userId;
    next();
  });
}
