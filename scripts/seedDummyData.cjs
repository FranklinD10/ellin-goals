const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('../serviceAccountKey.json'))
});
const db = admin.firestore();

async function seedAnalytics() {
  const dummyAnalytics = [
    { name: 'Page Views', value: 150, timestamp: admin.firestore.FieldValue.serverTimestamp() },
    { name: 'Active Users', value: 75, timestamp: admin.firestore.FieldValue.serverTimestamp() },
    { name: 'New Signups', value: 20, timestamp: admin.firestore.FieldValue.serverTimestamp() }
  ];
  
  for (const entry of dummyAnalytics) {
    await db.collection('analytics').add(entry);
    console.log(`Seeded analytics: ${entry.name}`);
  }
}

async function seedHabits() {
  // Create a dummy habit for user "el"
  const habitData = {
    name: 'Daily Run',
    category: 'health',
    userId: 'el',
    streak: 5,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    user_id: 'el'
  };
  const habitRef = await db.collection('habits').add(habitData);
  console.log('Seeded habit: Daily Run');
  return habitRef.id;
}

async function seedHabitLogs(habitId) {
  // Create a habit log entry for the seeded habit
  const logData = {
    habit_id: habitId,
    user_id: 'el',
    date: admin.firestore.FieldValue.serverTimestamp(),
    completed: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  await db.collection('habit_logs').add(logData);
  console.log('Seeded habit log for habit:', habitId);
}

async function seedAll() {
  await seedAnalytics();
  const habitId = await seedHabits();
  await seedHabitLogs(habitId);
}

seedAll()
  .then(() => {
    console.log('All dummy data seeded.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding data:', err);
    process.exit(1);
  });
