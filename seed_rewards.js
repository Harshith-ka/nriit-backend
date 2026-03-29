const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function seedRandomRewards() {
    console.log('🎲 Seeding Random Kinetic Rewards...');
    
    try {
        const usersSnap = await db.collection('users').get();
        console.log(`Found ${usersSnap.size} users.`);

        const batch = db.batch();

        usersSnap.docs.forEach(userDoc => {
            const randomPoints = Math.floor(Math.random() * 451) + 50; // 50 to 500
            const randomPosts = Math.floor(Math.random() * 10);
            const randomMatches = Math.floor(Math.random() * 15);
            
            batch.update(userDoc.ref, {
                rewardPoints: randomPoints,
                postsCount: randomPosts,
                matchesCount: randomMatches
            });
            console.log(`✨ ${userDoc.data().name || userDoc.id}: +${randomPoints} pts`);
        });

        await batch.commit();
        console.log('✅ Rewards seeded successfully! The Leaderboard is now alive.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    }
}

seedRandomRewards();
