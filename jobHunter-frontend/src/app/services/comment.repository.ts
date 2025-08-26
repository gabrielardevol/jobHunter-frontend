import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB, DBSchema } from 'idb';
import { Comment } from '../models/models';

interface CommentsDB extends DBSchema {
  comments: {
    key: string;
    value: Comment;
    indexes: { 'by-responseId': string };
  };
}

@Injectable({
  providedIn: 'root'
})
export class CommentsRepository {
  private db: IDBPDatabase<CommentsDB> | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    this.db = await openDB<CommentsDB>('commentsDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('comments')) {
          const store = db.createObjectStore('comments', { keyPath: 'id' });
          store.createIndex('by-responseId', 'responseId');
        }
      }
    });
    console.log('CommentsDB opened');
  }

  async init(): Promise<void> {
    this.db = await openDB<CommentsDB>('commentsDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('comments')) {
          const store = db.createObjectStore('comments', { keyPath: 'id' });
          store.createIndex('by-responseId', 'responseId');
        }
      }
    });
    console.log('CommentsDB opened');
  }

  async getAll(): Promise<Comment[]> {
    if (!this.db) return [];
    return this.db.getAll('comments');
  }

  async getById(id: string): Promise<Comment | undefined> {
    if (!this.db) return undefined;
    return this.db.get('comments', id);
  }

  async save(comment: Comment): Promise<void> {
    if (!this.db) return;
    await this.db.put('comments', comment);
  }

  async delete(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.delete('comments', id);
  }
}
