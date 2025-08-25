import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Offer } from '../models/models';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment.development';
import { SnackbarService } from './snack.service';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { OFFERS } from '../offers.mock';

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
export class OffersService {
  private db: IDBPDatabase<OffersDB> | null = null;
  private offersSubject = new BehaviorSubject<Offer[]>([]);
  offers$: Observable<Offer[]> = this.offersSubject.asObservable();

  constructor(private snackbarService: SnackbarService) {
    this.initDB();
  }

  private async initDB() {
    if (environment.mockData) {
      this.offersSubject.next([...OFFERS]);
      return;
    }

    this.db = await openDB<OffersDB>('offersDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('offers')) {
          const store = db.createObjectStore('offers', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
        }
      }
    });

    await this.refreshOffers();
    console.log('DB correctly opened');
  }

  private async refreshOffers() {
    if (!this.db) return;
    const allOffers = await this.db.getAll('offers');
    this.offersSubject.next(allOffers.filter(o => !o.deletedAt));
  }

  async addOffer(offer: Offer) {
    offer.id = uuidv4();
    offer.createdAt = new Date();
    offer.status = "waiting";

    const current = this.offersSubject.value;
    this.offersSubject.next([...current, offer]);

    if (!this.db) return;
    await this.db.put('offers', offer);
    console.log('Offer saved to IndexedDB');
  }

async updateOffer(id: string, updatedOffer: Offer) {
  if (!this.db) return;

  updatedOffer.id = updatedOffer.id ?? id;

  await this.db.put('offers', updatedOffer);

  const current = this.offersSubject.value;
  this.offersSubject.next(current.map(o => o.id === id ? updatedOffer : o));
  console.log(`Offer ${id} updated`);
}


  async deleteOffer(id: string) {
    if (!this.db) return;

    const offer = await this.db.get('offers', id);
    if (!offer) return;

    offer.deletedAt = new Date();
    await this.db.put('offers', offer);

    this.snackbarService.addSnackbar({
      id: uuidv4(),
      message: 'Offer has been deleted',
      action: () => this.restoreOffer(id)
    });

    await this.refreshOffers();
    console.log(`Offer ${id} soft-deleted`);
  }

  async restoreOffer(id: string) {
    if (!this.db) return;

    const offer = await this.db.get('offers', id);
    if (!offer) return;

    offer.deletedAt = undefined;
    await this.db.put('offers', offer);

    await this.refreshOffers();
    console.log(`Offer ${id} restored`);
  }

  getOffer(offerId: string): Observable<Offer | undefined> {
    return this.offers$.pipe(
      map(offers => offers.find(o => o.id === offerId))
    );
  }
}
