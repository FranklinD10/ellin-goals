import { Handler } from '@netlify/functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin once
let firebaseApp: admin.app.App;
if (!admin.apps.length) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

interface IndexRequest {
  collectionId: string;
  fields: Array<{
    fieldPath: string;
    order: 'ASCENDING' | 'DESCENDING'
  }>;
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { collectionId, fields } = JSON.parse(event.body || '{}') as IndexRequest;

    if (!collectionId || !fields?.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Create the index definition
    const indexDefinition = {
      collectionGroup: collectionId,
      queryScope: 'COLLECTION',
      fields: fields
    };

    // Store index request in Firestore
    const db = admin.firestore();
    await db.collection('_indexes').add({
      ...indexDefinition,
      status: 'CREATING',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Index creation initiated'
      })
    };
  } catch (error) {
    console.error('Error creating index:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create index' })
    };
  }
};
