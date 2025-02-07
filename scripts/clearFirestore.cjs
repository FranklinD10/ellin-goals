const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('../serviceAccountKey.json'))
});
const db = admin.firestore();

async function clearCollection(collectionName) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`Collection ${collectionName} is already empty`);
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`Cleared collection: ${collectionName}`);
}

async function initializeBaseStructure() {
  // Create default user documents
  const usersRef = db.collection('users');
  const defaultUsers = [
    {
      uid: 'el-default',
      email: 'el@example.com',
      displayName: 'El',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        theme: 'light',
        notifications: true
      }
    },
    {
      uid: 'lin-default',
      email: 'lin@example.com',
      displayName: 'Lin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        theme: 'light',
        notifications: true
      }
    }
  ];

  for (const user of defaultUsers) {
    await usersRef.doc(user.uid).set(user);
    console.log(`Created default user: ${user.displayName}`);
  }
}

async function clearAndReinitialize() {
  const collections = ['users', 'habits', 'habit_logs', 'analytics', 'user_settings'];
  
  // Clear all collections
  for (const collection of collections) {
    await clearCollection(collection);
  }
  
  // Initialize new structure
  await initializeBaseStructure();
  
  console.log('Database cleared and reinitialized with base structure');
}

clearAndReinitialize()
  .then(() => {
    console.log('Database reset complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during database reset:', error);
    process.exit(1);
  });
