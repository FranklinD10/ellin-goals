import { 
  collection, 
  query, 
  QueryConstraint, 
  getDocs,
  FirebaseError 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import { IndexLogger } from './indexLogger';
import axios from 'axios';

interface IndexConfig {
  collection: string;
  fields: string[];
  orderBy?: string[];
}

interface IndexRequest extends IndexConfig {
  timestamp: number;
  retries: number;
  lastError?: string;
}

export class IndexManager {
  private static indexRequests = new Map<string, IndexRequest>();
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_RETRY_INTERVAL = 1000;

  static async verifyQuery(
    collection: string,
    constraints: QueryConstraint[],
    fallbackConstraints: QueryConstraint[]
  ) {
    try {
      const q = query(collection(db, collection), ...constraints);
      const snapshot = await getDocs(q);
      return { query: q, needsFallback: false };
    } catch (error) {
      if (this.isIndexError(error as FirebaseError)) {
        const config = this.extractIndexConfig(error as FirebaseError);
        await this.handleMissingIndex(config);
        
        // Use fallback query while index is being created
        const fallbackQ = query(collection(db, collection), ...fallbackConstraints);
        return { query: fallbackQ, needsFallback: true };
      }
      throw error;
    }
  }

  private static async handleMissingIndex(config: IndexConfig) {
    const key = this.getIndexKey(config);
    const existing = this.indexRequests.get(key);

    if (!existing) {
      await this.initiateIndexCreation(config);
    } else if (this.shouldRetry(existing)) {
      await this.retryIndexCreation(existing);
    }
  }

  private static async initiateIndexCreation(config: IndexConfig) {
    IndexLogger.detected(config.collection, config.fields);
    
    try {
      await this.createIndex(config);
      IndexLogger.initiating(config.collection);
      
      this.indexRequests.set(this.getIndexKey(config), {
        ...config,
        timestamp: Date.now(),
        retries: 0
      });

      this.scheduleVerification(config);
    } catch (error) {
      IndexLogger.error(config.collection, error);
    }
  }

  private static async createIndex(config: IndexConfig) {
    try {
      const createIndexFunction = httpsCallable(functions, 'createIndex');
      const result = await createIndexFunction(config);
      
      if (result.data.success) {
        IndexLogger.initiating(config.collection);
        return true;
      }
      return false;
    } catch (error) {
      IndexLogger.error(config.collection, error);
      return false;
    }
  }

  private static async verifyIndex(config: IndexConfig) {
    try {
      const constraints = this.buildConstraints(config);
      const q = query(collection(db, config.collection), ...constraints);
      await getDocs(q);
      return true;
    } catch (error) {
      return false;
    }
  }

  private static buildConstraints(config: IndexConfig): QueryConstraint[] {
    // Build query constraints based on config
    // This would need to be implemented based on your specific needs
    return [];
  }

  private static getIndexKey(config: IndexConfig): string {
    return `${config.collection}:${config.fields.join(',')}`;
  }

  private static isIndexError(error: FirebaseError): boolean {
    return error.code === 'failed-precondition' && 
           error.message?.includes('requires an index');
  }

  private static extractIndexConfig(error: FirebaseError): IndexConfig {
    // Extract collection and fields from error message
    // This would need to be implemented based on Firebase error format
    return {
      collection: '',
      fields: []
    };
  }

  private static shouldRetry(request: IndexRequest): boolean {
    return request.retries < this.MAX_RETRIES;
  }

  private static async retryIndexCreation(request: IndexRequest) {
    request.retries++;
    request.timestamp = Date.now();
    
    IndexLogger.retrying(request.collection, request.retries);
    await this.createIndex(request);
  }

  private static scheduleVerification(config: IndexConfig) {
    const interval = this.BASE_RETRY_INTERVAL * 
      Math.pow(2, this.indexRequests.get(this.getIndexKey(config))?.retries || 0);

    setTimeout(async () => {
      const isValid = await this.verifyIndex(config);
      if (isValid) {
        IndexLogger.success(config.collection);
        this.indexRequests.delete(this.getIndexKey(config));
      } else {
        const request = this.indexRequests.get(this.getIndexKey(config));
        if (request && this.shouldRetry(request)) {
          await this.retryIndexCreation(request);
          this.scheduleVerification(config);
        } else {
          IndexLogger.maxRetriesReached(config.collection, config.fields);
        }
      }
    }, interval);
  }
}
