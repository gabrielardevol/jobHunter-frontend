import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Offer } from './models/models';
import { OFFERS } from './mocks/offers.mock';

@Injectable({
  providedIn: 'root'
})
export class OffersService {

  private offers: Offer[] = [...OFFERS];

  constructor() {}

  getOffers(): Observable<Offer[]> {
    return of(this.offers);
  }

  getOffer(index: number): Observable<Offer | undefined> {
    return of(this.offers[index]);
  }

  addOffer(offer: Offer): Observable<Offer> {
    this.offers.push(offer);
    return of(offer);
  }

  updateOffer(index: number, offer: Offer): Observable<Offer | undefined> {
    if (this.offers[index]) {
      this.offers[index] = offer;
      return of(offer);
    }
    return of(undefined);
  }

  deleteOffer(index: number): Observable<boolean> {
    if (this.offers[index]) {
      this.offers.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
