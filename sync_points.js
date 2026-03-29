const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function syncAllPoints() {
    console.log('🔄 Starting Kinetic Reward Synchronization...');
    
    try {
        const usersSnap = await db.collection('users').get();
        console.log(`Found ${usersSnap.size} users. Calculating contribution scores...`);

        for (const userDoc of usersSnap.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();
            
            let points = 0;

            // 1. Posts contribute +10 each
            const postsSnap = await db.collection('community_posts').where('ownerId', '==', userId).get();
            points += (postsSnap.size * 10);

            // 2. Upvotes received contribute +5 each
            for (const postDoc of postsSnap.docs) {
                const post = postDoc.data();
                points += ((post.upvotes || 0) * 5);
            }

            // 3. Connections contribute +20 each (Approximation via matches)
            const matchesSnap = await db.collection('matches').where('users', 'array-contains', userId).get();
            points += (matchesSnap.size * 20);

            // 4. Projects Showcase Bonus +100
            if (userData.projects && userData.projects.length > 0) {
                points += 100;
            }

            // Update user with calculated points
            await userDoc.ref.update({
                rewardPoints: points,
                postsCount: postsSnap.size,
                matchesCount: matchesSnap.size
            });

            console.log(`✅ ${userData.name || userId}: ${points} pts`);
        }

        console.log('🚀 Synchronization complete! Ecosystem is now gamified.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Sync failed:', e);
        process.exit(1);
    }
}

syncAllPoints();
