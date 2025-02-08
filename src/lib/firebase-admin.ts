import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize admin app if not already initialized
export function getAdminApp() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(require('../../serviceAccountKey.json'))
    });
  }
  return getApps()[0];
}

export async function createIndex(collectionPath: string, fields: string[]) {
  const adminDb = getFirestore(getAdminApp());
  
  try {
    console.log(`Creating index for collection: ${collectionPath}`);
    console.log(`Fields: ${fields.join(', ')}`);
    
    const collection = adminDb.collection(collectionPath);
    await collection.createIndex(fields);
    
    console.log(`Successfully created index for ${collectionPath}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to create index for ${collectionPath}:`, error);
    return { success: false, error };
  }
}
