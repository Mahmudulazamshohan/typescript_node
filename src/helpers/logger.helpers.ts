import { Request, Response, NextFunction } from "express";
import URL from "url";
import { debugPrint } from ".";
export default (req: Request, res: Response, next: NextFunction) => {
  debugPrint(
    URL.format({
      protocol: req.protocol,
      host: req.get("host"),
      pathname: req.originalUrl,
    })
  );
  next();
};
