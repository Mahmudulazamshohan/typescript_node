import { Request, Response, NextFunction } from "express";
export const AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("auth");
  next();
};
