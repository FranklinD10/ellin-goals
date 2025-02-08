const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin with your service account
admin.initializeApp({
  credential: admin.credential.cert(require('../serviceAccountKey.json'))
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function clearCollections() {
  try {
    console.log('Starting cleanup...');

    // Clear habits
    const habitsSnapshot = await db.collection('habits').get();
    const habitBatch = db.batch();
    habitsSnapshot.docs.forEach(doc => {
      habitBatch.delete(doc.ref);
    });
    await habitBatch.commit();
    console.log(`Deleted ${habitsSnapshot.size} habits`);

    // Clear habit logs
    const logsSnapshot = await db.collection('habit_logs').get();
    const logBatch = db.batch();
    logsSnapshot.docs.forEach(doc => {
      logBatch.delete(doc.ref);
    });
    await logBatch.commit();
    console.log(`Deleted ${logsSnapshot.size} habit logs`);

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    process.exit(0);
  }
}

// Ask for confirmation before proceeding
rl.question('This will delete ALL habits and habit logs. Are you sure? (yes/no) ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    clearCollections();
  } else {
    console.log('Operation cancelled');
    process.exit(0);
  }
});
