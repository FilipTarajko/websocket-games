import jwt from "jsonwebtoken";

export function checkAuth(req: any, res: any, next: any) {
  console.log(req.cookies)
  res.setHeader('Content-Type', 'application/json');
  jwt.verify(req.cookies.token, process.env.JWT_SECRET!, function (err: any, decoded: any) {
    if (err) {
      res.status(401).json("Unauthorized");
      return;
    }
    if (!decoded) {
      res.status(401).json("Unauthorized");
      return;
    }
    req.username = decoded.username;
    req.userId = decoded.userId;
    next();
  });
}
