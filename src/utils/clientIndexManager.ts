import { collection, query, QueryConstraint, getDocs, FirebaseError } from 'firebase/firestore';
import { db } from '../lib/firebase';
import axios from 'axios';

export class ClientIndexManager {
  private static readonly RETRY_DELAY = 2000;
  private static readonly MAX_RETRIES = 3;

  static async executeQueryWithFallback<T>(
    collectionName: string,
    primaryConstraints: QueryConstraint[],
    fallbackConstraints: QueryConstraint[],
    filterFn?: (doc: T) => boolean
  ): Promise<T[]> {
    try {
      const primaryQuery = query(collection(db, collectionName), ...primaryConstraints);
      const snapshot = await getDocs(primaryQuery);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
    } catch (error) {
      if (this.isIndexError(error as FirebaseError)) {
        const basicQuery = query(
          collection(db, collectionName),
          ...fallbackConstraints
        );
        
        const snapshot = await getDocs(basicQuery);
        let results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
        
        if (filterFn) {
          results = results.filter(filterFn);
        }

        return results;
      }
      return []; // Return empty array on error
    }
  }

  private static isIndexError(error: FirebaseError): boolean {
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
      
      // Call Netlify function instead of Firebase function
      const response = await axios.post('/.netlify/functions/create-firestore-index', {
        collectionId,
        fields
      });
      
      return true;
    } catch (error) {
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
