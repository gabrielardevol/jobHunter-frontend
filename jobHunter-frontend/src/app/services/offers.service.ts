import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { Offer } from '../models/models';
import { OFFERS } from '../mocks/offers.mock';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment.development';
@Injectable({
  providedIn: 'root'
})
export class OffersService {

  private offersSubject: BehaviorSubject<Offer[]> = new BehaviorSubject<Offer[]>([]);
  offers$: Observable<Offer[]> = this.offersSubject.asObservable();
  private db: IDBDatabase | null = null;

  constructor() {
    environment.mockData ? this.fetchOffers() : this.openIDBAndFetch();
  }

   openIDBAndFetch(): void {
    const request = indexedDB.open('offersDB', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('offers')) {
        db.createObjectStore('offers', { keyPath: 'id' });
      }
    }; 

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.fetchOffers();
      console.log('DB correctly open');
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB', event);
    };
  }

  fetchOffers() {
    if (environment.mockData) this.offersSubject.next([...OFFERS]);

    if (!this.db) return;

    const tx = this.db.transaction('offers', 'readwrite');
    const store = tx.objectStore('offers');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const offers = getAllRequest.result;
      this.offersSubject.next(offers);
      console.log('Offers retrieved from IndexedDB', offers);
    };

    getAllRequest.onerror = (e) => {
      console.error('Error reading offers from IndexedDB', e);
    };
  }

  getOffer(offerId: string): Observable<Offer | undefined> {
    return this.offers$.pipe(
        map(offers => offers.find(offer => offer.id === offerId))
      );
  }

  addOffer(offer: Offer) {
    offer.id = uuidv4();
    offer.createdAt = new Date();
    offer.status = "waiting";
    
    const currentOffers = this.offersSubject.value;
    this.offersSubject.next([...currentOffers, offer]);

    if (!this.db) return;

    const tx = this.db.transaction('offers', 'readwrite');
    const store = tx.objectStore('offers');
    store.put(offer);

    tx.oncomplete = () => console.log('Offer saved to IndexedDB');
    tx.onerror = (e) => console.error('Error saving offer to IndexedDB', e);
  }

  updateOffer(id: string, updatedOffer: Offer) {
    const current = this.offersSubject.value;
    const updated = current.map(offer =>
      offer.id === id ? { ...offer, ...updatedOffer } : offer
    );
    this.offersSubject.next(updated);

    if (!this.db) return;
    const tx = this.db.transaction('offers', 'readwrite');
    const store = tx.objectStore('offers');
    store.put(updatedOffer);

    tx.oncomplete = () => console.log('Offer updated at IndexedDB');
    tx.onerror = (e) => console.error('Error updating offer at IndexedDB', e);
  }

  deleteOffer(id: string) {
    const current = this.offersSubject.value;
    const updated = current.filter(offer => offer.id !== id);
    this.offersSubject.next(updated);

    if (!this.db) return;
    const tx = this.db.transaction('offers', 'readwrite');
    const store = tx.objectStore('offers');

    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => console.log(`Offer ${id} deleted from IndexedDB`);
    deleteRequest.onerror = (e) => console.error('Error deleting offer from ndexedDB', e);
  }  
}
