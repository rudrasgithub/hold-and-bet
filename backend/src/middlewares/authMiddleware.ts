import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
}

export interface CustomRequest extends Request {
  user?: User;
}

export default function authenticate(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('no token');
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  console.log('token generated');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload as User;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: 'Invalid token' });
  }
}
