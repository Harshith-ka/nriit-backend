import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

const serviceAccount = require('../../serviceAccountKey.json');

// Initialize the Firebase Admin SDK for token verification and Firestore queries
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};
