import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
// TODO: Implement this middleware

const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers.authorization;
  if (bearerToken) {
    let bearer = /bearer/i;

    if (!bearer.test(bearerToken)) {
      return res.status(401).json({ message: "use bearer token" });
    }

    let token = bearerToken.split(" ")[1];
    const secret = process.env.ACCESS_SECRET;

    if (!secret) {
      return res.status(500).json({ message: "No secret provided" });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      next();
    });
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

export default verifyJwt;
