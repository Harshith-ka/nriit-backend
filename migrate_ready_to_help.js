const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateReadyToHelp() {
  console.log('--- Starting User Migration: isReadyToHelp=true ---');
  
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  if (snapshot.empty) {
    console.log('No users found in database.');
    process.exit(0);
  }

  let totalUpdated = 0;
  let batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Only update if the flag isn't already set to true to save operations
    if (data.isReadyToHelp !== true) {
      batch.update(doc.ref, { isReadyToHelp: true });
      count++;
      totalUpdated++;
    }

    // Firestore batch limit is 500
    if (count === 500) {
      console.log(`Committing batch of ${count} updates...`);
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }

  // Commit remaining
  if (count > 0) {
    console.log(`Committing final batch of ${count} updates...`);
    await batch.commit();
  }

  console.log('--- Migration Complete ---');
  console.log(`Total active users modified: ${totalUpdated}`);
  process.exit(0);
}

migrateReadyToHelp().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
