import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { Offer, TextSource } from '../models/models';
import { OFFERS } from '../mocks/offers.mock';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment.development';
import { TEXT_SOURCE } from '../mocks/textSource.mock';
@Injectable({
  providedIn: 'root'
})
export class TextSourceService {

  private textSourceSubject: BehaviorSubject<TextSource[]> = new BehaviorSubject<TextSource[]>([]);
  textSources$: Observable<TextSource[]> = this.textSourceSubject.asObservable();
  private db: IDBDatabase | null = null;

  constructor() {
    environment.mockData ? this.fetchTextSources() : this.openIDBAndFetch();
  }

   openIDBAndFetch(): void {
    const request = indexedDB.open('textSourcesDB', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('textSources')) {
        db.createObjectStore('textSources', { keyPath: 'id' });
      }
    }; 

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.fetchTextSources();
      console.log('DB correctly open');
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB', event);
    };
  }

  fetchTextSources() {
    if (environment.mockData) this.textSourceSubject.next([...TEXT_SOURCE]);
    

    if (!this.db) return;

    const tx = this.db.transaction('textSources', 'readwrite');
    const store = tx.objectStore('textSources');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const offers = getAllRequest.result;
      this.textSourceSubject.next(offers);
      console.log('textSources retrieved from IndexedDB', offers);
    };

    getAllRequest.onerror = (e) => {
      console.error('Error reading textSources from IndexedDB', e);
    };
  }

  getOfferTextSource(id: string): Observable<TextSource | undefined> {
    console.log('getTextSource' , id)
    return this.textSources$.pipe(
        map(textSources => textSources.find(textSource => textSource.offerId == id))
      );
  }

  addTextSource(textSource: TextSource) {
    textSource.id = uuidv4();
    textSource.createdAt = new Date();
    
    const currentState = this.textSourceSubject.value;
    this.textSourceSubject.next([...currentState, textSource]);

    console.log(textSource)
    if (!this.db) return;

    const tx = this.db.transaction('textSources', 'readwrite');
    const store = tx.objectStore('textSources');
    store.put(textSource);

    tx.oncomplete = () => console.log('textSources saved to IndexedDB');
    tx.onerror = (e) => console.error('Error saving textSources to IndexedDB', e);
  }

  deleteTextSource(id: string) {
    const current = this.textSourceSubject.value;
    const updated = current.filter(offer => offer.id !== id);
    this.textSourceSubject.next(updated);

    if (!this.db) return;
    const tx = this.db.transaction('textSources', 'readwrite');
    const store = tx.objectStore('textSources');

    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => console.log(`textSource ${id} deleted from IndexedDB`);
    deleteRequest.onerror = (e) => console.error('Error deleting textSource from IndexedDB', e);
  }  
}
