import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { Offer } from '../models/models';
import { OFFERS } from '../offers.mock';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment.development';
import { SnackbarService } from './snack.service';
@Injectable({
  providedIn: 'root'
})
export class OffersService {

  private offersSubject: BehaviorSubject<Offer[]> = new BehaviorSubject<Offer[]>([]);
  offers$: Observable<Offer[]> = this.offersSubject.asObservable();
  private db: IDBDatabase | null = null;

  constructor(public snackbarService: SnackbarService) {
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
    if (environment.mockData) {
      this.offersSubject.next([...OFFERS]);
    }

    if (!this.db) return;

    const tx = this.db.transaction('offers', 'readonly');
    const store = tx.objectStore('offers');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const offers = getAllRequest.result
        .filter(offer => offer.deletedAt === undefined); // només no eliminades
      this.offersSubject.next(offers);
      console.log('Offers retrieved from IndexedDB (not deleted):', offers);
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
    console.log(offer)
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
    const updated = current.map(offer => 
      offer.id === id ? { ...offer, deletedAt: new Date() } : offer
    );

    this.offersSubject.next(updated.filter(o => !o.deletedAt));

    if (!this.db) return;

    const tx = this.db.transaction('offers', 'readwrite');
    const store = tx.objectStore('offers');

    let snackbarId = uuidv4();
    this.snackbarService.addSnackbar({
       id: snackbarId,
      message: 'Offer has been deleted',
      action: () => this.restoreOffer(id)
    })

    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const offer = getRequest.result;
      if (offer) {
        offer.deletedAt = new Date();
        store.put(offer);
      }
    };

  }

  restoreOffer(id: string) { //mergeable with updateOffer
    if (!this.db) return;

    const tx = this.db.transaction('offers', 'readwrite');
    const store = tx.objectStore('offers');

    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const offer = getRequest.result;
      if (offer) {
        offer.deletedAt = undefined;
        const updateRequest = store.put(offer);
        updateRequest.onsuccess = () => {
          console.log(`Offer ${id} restored`);
          const current = this.offersSubject.value;
          const updated = [...current.filter(o => o.id !== id), offer];
          this.offersSubject.next(updated);
        };
        updateRequest.onerror = (e) => console.error('Error restoring offer in IndexedDB', e);
      }
    };

    getRequest.onerror = (e) => console.error('Error fetching offer from IndexedDB', e);
  }

}
