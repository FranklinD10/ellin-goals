import { 
  collection, 
  query, 
  QueryConstraint, 
  getDocs, 
  FirestoreError // Changed from FirebaseError
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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
}
