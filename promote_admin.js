const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function promoteAdmin(email) {
  const userSnap = await db.collection('users').where('email', '==', email).get();
  if (userSnap.empty) {
    console.log('No user found with email:', email);
    return;
  }

  const userId = userSnap.docs[0].id;
  await db.collection('users').doc(userId).update({ isAdmin: true });
  console.log('Successfully promoted', email, 'to ADMIN status.');
  process.exit(0);
}

promoteAdmin('harry@example.com');
