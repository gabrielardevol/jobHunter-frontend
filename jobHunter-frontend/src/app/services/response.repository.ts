import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB, DBSchema } from 'idb';
import { Response } from '../models/models';

interface ResponsesDB extends DBSchema {
  responses: {
    key: string;
    value: Response;
    indexes: { 'by-offerId': string; 'by-status': string };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ResponsesRepository {
  private db: IDBPDatabase<ResponsesDB> | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    this.db = await openDB<ResponsesDB>('responsesDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('responses')) {
          const store = db.createObjectStore('responses', { keyPath: 'id' });
          store.createIndex('by-offerId', 'offerId');
          store.createIndex('by-status', 'status');
        }
      }
    });
    console.log('ResponsesDB opened');
  }

  async init(): Promise<void> {
    this.db = await openDB<ResponsesDB>('responsesDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('responses')) {
          const store = db.createObjectStore('responses', { keyPath: 'id' });
          store.createIndex('by-offerId', 'offerId');
          store.createIndex('by-status', 'status');
        }
      }
    });
    console.log('ResponsesDB opened');
  }

  async getAll(): Promise<Response[]> {
    if (!this.db) return [];
    return this.db.getAll('responses');
  }

  async getById(id: string): Promise<Response | undefined> {
    if (!this.db) return undefined;
    return this.db.get('responses', id);
  }

  async save(response: Response): Promise<void> {
    if (!this.db) return;
    await this.db.put('responses', response);
  }

  async delete(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.delete('responses', id);
  }
}
