import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';

// Fetch Cognito public keys
const client = jwksClient({
  jwksUri: `https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_6VQb4fuyB/.well-known/jwks.json`, // Replace with your User Pool ID and region
});

// Get the public key
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

// Middleware to verify the JWT
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.error('No token found in Authorization header');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }


  jwt.verify(token, getKey, {}, (err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    (req as any).user = decoded;
    next();
  });
};
