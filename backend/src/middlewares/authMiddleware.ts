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
  console.log(`\n🔐 Auth Middleware Hit: ${req.method} ${req.originalUrl}`);
  console.log(
    'Authorization header:',
    req.headers.authorization ? 'Present' : 'Missing'
  );

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('❌ No token provided');
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  console.log('✅ Token received:', token.substring(0, 20) + '...');

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload as User;
    console.log('✅ Token verified for user:', req.user.email);
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}
