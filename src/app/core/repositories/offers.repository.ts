import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB, DBSchema } from 'idb';
import { Offer } from '../models/models';

interface OffersDB extends DBSchema {
  offers: {
    key: string;
    value: Offer;
    indexes: { 'by-status': string };
  };
}

@Injectable({
  providedIn: 'root'
})
export class OffersRepository {
  private db: IDBPDatabase<OffersDB> | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    this.db = await openDB<OffersDB>('offersDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('offers')) {
          const store = db.createObjectStore('offers', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
        }
      }
    });
    console.log('OffersDB opened');
  }

  async init(): Promise<void> {
    this.db = await openDB<OffersDB>('offersDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('offers')) {
          const store = db.createObjectStore('offers', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
        }
      }
    });
    console.log('OffersDB opened');
  }
  
  async getAll(): Promise<Offer[]> {
    if (!this.db) return [];
    return this.db.getAll('offers');
  }

  async getById(id: string): Promise<Offer | undefined> {
    if (!this.db) return undefined;
    return this.db.get('offers', id);
  }

  async save(offer: Offer): Promise<void> {
    if (!this.db) return;
    await this.db.put('offers', offer);
  }

  async delete(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.delete('offers', id);
  }
}
