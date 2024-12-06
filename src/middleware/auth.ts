import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';

//ANCHOR - Fetch Cognito public keys
const client = jwksClient({
  jwksUri: `${process.env.JWKSURI}`, 
});

//ANCHOR - Get the public key
const getKey = (header: any, callback: any) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      callback(new Error('Failed to retrieve public key'));
      return;
    }
    const signingKey = (key as jwksClient.SigningKey).getPublicKey();
    callback(null, signingKey);
  });
};

//ANCHOR - Middleware to verify the JWT
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.error('No token found in Authorization header');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }


  jwt.verify(token, getKey, {}, (err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err?.message);
      res.status(403).json({ error: err?.message || 'Forbidden' });
      return;
    }
    (req as any).user = decoded;
    next();
  });
};
