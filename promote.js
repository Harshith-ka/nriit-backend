const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function promoteHarry() {
    const email = 'harry@example.com';
    console.log(`Searching for user with email: ${email}...`);
    
    try {
        const snap = await db.collection('users').where('email', '==', email).get();
        if (snap.empty) {
            console.error('Error: No user found with that email.');
            process.exit(1);
        }

        const userDoc = snap.docs[0];
        await userDoc.ref.update({
            isAdmin: true,
            onboardingCompleted: true,
            isVerified: true
        });

        console.log(`Success! ${email} has been promoted to Admin.`);
        console.log('Changes: isAdmin = true, onboardingCompleted = true, isVerified = true');
        process.exit(0);
    } catch (e) {
        console.error('Promotion failed:', e);
        process.exit(1);
    }
}

promoteHarry();
