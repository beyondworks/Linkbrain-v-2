
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./service-account.json');

try {
    initializeApp({
        credential: cert(serviceAccount)
    });
} catch (e) {
    // Ignore if already initialized
}

const db = getFirestore();

async function checkClips() {
    console.log('Checking clips data...');
    const snapshot = await db.collection('clips').limit(5).get();

    if (snapshot.empty) {
        console.log('No clips found.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`UserId: ${data.userId}`);
        console.log(`CreatedAt:`, data.createdAt, `Type: ${typeof data.createdAt}`);
        if (data.createdAt && data.createdAt.toDate) {
            console.log('CreatedAt is a Firestore Timestamp');
        }
        console.log('---');
    });
}

checkClips();
