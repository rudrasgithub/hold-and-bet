import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type RequestType = {
  [prop: string]: any
} & Request

export const authenticate = (req: RequestType, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET!, (err, payload) => {
      if (err)
          res.status(400).json({ error: 'Invalid or expired auth token' })
      req.user = payload
      return next()
  })
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
