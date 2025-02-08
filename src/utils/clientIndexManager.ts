import { 
  collection, 
  query, 
  QueryConstraint, 
  getDocs, 
  FirestoreError // Changed from FirebaseError
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import axios from 'axios'; // Add axios import

interface CreateIndexResponse {
  success: boolean;
  message?: string;
}

export class ClientIndexManager {
  static async executeQueryWithFallback<T>(
    collectionPath: string,
    primaryConstraints: QueryConstraint[],
    fallbackConstraints: QueryConstraint[],
    filterFn?: (doc: T) => boolean
  ): Promise<T[]> {
    try {
      const q = query(collection(db, collectionPath), ...primaryConstraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
    } catch (error) {
      if (this.isIndexError(error as FirestoreError)) {
        try {
          const fallbackQ = query(collection(db, collectionPath), ...fallbackConstraints);
          const snapshot = await getDocs(fallbackQ);
          let results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
          
          if (filterFn) {
            results = results.filter(filterFn);
          }

          return results;
        } catch (fallbackError) {
          console.error('Fallback query failed:', fallbackError);
          return [];
        }
      }
      return [];
    }
  }

  private static isIndexError(error: FirestoreError): boolean {
    return error.code === 'failed-precondition' && 
           error.message?.includes('requires an index');
  }

  private static extractIndexUrl(errorMessage: string): string {
    const urlMatch = errorMessage.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
    return urlMatch ? urlMatch[0] : 'No URL found';
  }

  private static async createIndexFromError(errorMessage: string, collectionId: string) {
    try {
      const fields = this.parseIndexFieldsFromError(errorMessage);
      
      const response = await axios.post<CreateIndexResponse>(
        '/.netlify/functions/create-firestore-index',
        { collectionId, fields }
      );
      
      return response.data.success;
    } catch (error) {
      console.error('Failed to create index:', error);
      return false;
    }
  }

  private static parseIndexFieldsFromError(errorMessage: string): Array<{fieldPath: string, order: string}> {
    // Extract the fields from the Firebase error message URL
    const url = this.extractIndexUrl(errorMessage);
    const params = new URLSearchParams(url.split('?')[1]);
    const indexDef = params.get('create_composite');
    
    // Parse the base64 encoded index definition
    // This is a simplified example - you'll need to properly parse your error URL
    const fields = indexDef?.split(',').map(field => {
      const [path, order] = field.split(':');
      return {
        fieldPath: path,
        order: order === 'desc' ? 'DESCENDING' : 'ASCENDING'
      };
    }) || [];

    return fields;
  }
}
