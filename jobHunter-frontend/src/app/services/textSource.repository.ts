import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB, DBSchema } from 'idb';
import { TextSource } from '../models/models';

interface TextSourcesDB extends DBSchema {
  textSources: {
    key: string;
    value: TextSource;
    indexes: { 'by-status': string };
  };
}

@Injectable({
  providedIn: 'root'
})
export class TextSourcesRepository {
  private db: IDBPDatabase<TextSourcesDB> | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    this.db = await openDB<TextSourcesDB>('textSourcesDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('textSources')) {
          const store = db.createObjectStore('textSources', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
        }
      }
    });
    console.log('textSourcesDB opened');
  }

  async init(): Promise<void> {
    this.db = await openDB<TextSourcesDB>('textSourcesDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('textSources')) {
          const store = db.createObjectStore('textSources', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
        }
      }
    });
    console.log('textSources opened');
  }
  
  async getAll(): Promise<TextSource[]> {
    if (!this.db) return [];
    return this.db.getAll('textSources');
  }

  async getById(id: string): Promise<TextSource | undefined> {
    if (!this.db) return undefined;
    return this.db.get('textSources', id);
  }

  async save(offer: TextSource): Promise<void> {
    if (!this.db) return;
    await this.db.put('textSources', offer);
  }

  async delete(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.delete('textSources', id);
  }
}
