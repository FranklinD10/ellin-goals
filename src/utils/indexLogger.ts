export class IndexLogger {
  private static readonly PREFIX = '🗂️ [Index]';

  static detected(collection: string, fields: string[]) {
    if (import.meta.env.DEV) {
      console.info(
        `${this.PREFIX} Missing Firestore index detected for ${collection} on fields: ${fields.join(', ')}`
      );
    }
  }

  static initiating(collection: string) {
    if (import.meta.env.DEV) {
      console.info(
        `${this.PREFIX} Initiating automatic index creation for ${collection}...`
      );
    }
  }

  static retrying(collection: string, attempt: number) {
    if (import.meta.env.DEV) {
      console.info(
        `${this.PREFIX} Retry attempt ${attempt} for ${collection} index creation`
      );
    }
  }

  static success(collection: string) {
    if (import.meta.env.DEV) {
      console.info(
        `${this.PREFIX} Index creation confirmed for ${collection}`
      );
    }
  }

  static error(collection: string, error: any) {
    if (import.meta.env.DEV) {
      console.warn(
        `${this.PREFIX} Index creation failed for ${collection}:`,
        error
      );
    }
  }

  static maxRetriesReached(collection: string, fields: string[]) {
    if (import.meta.env.DEV) {
      console.error(
        `${this.PREFIX} Max retries reached for ${collection} index creation. Manual creation may be required for fields: ${fields.join(', ')}`
      );
    }
  }

  static fallback(collection: string) {
    if (import.meta.env.DEV) {
      console.info(
        `${this.PREFIX} Using optimized fallback query for ${collection}`
      );
    }
  }
}
