import { Request, Response, NextFunction } from "express";

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.method, req.path, req.headers.origin);
  next();
};

export default logRequest;
