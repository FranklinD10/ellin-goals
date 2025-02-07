const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
const db = admin.firestore();

async function clearCollection(collectionName) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  if (snapshot.empty) return;
  const batchSize = snapshot.size;
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`Cleared collection: ${collectionName}`);
}

async function clearFirestore() {
  const collections = ['habits', 'habit_logs', 'analytics'];
  for (const coll of collections) {
    await clearCollection(coll);
  }
  console.log('Firestore cleared and ready with new structure.');
}

clearFirestore().catch(error => console.error(error));
