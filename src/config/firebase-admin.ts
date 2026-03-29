import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
