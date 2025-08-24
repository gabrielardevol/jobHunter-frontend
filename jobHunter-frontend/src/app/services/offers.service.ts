import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Offer } from '../models/models';
import { OFFERS } from '../mocks/offers.mock';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OffersService {

  mock: boolean = true;
  private mockOffers: Offer[] = [...OFFERS];
  private offersSubject: BehaviorSubject<Offer[]> = new BehaviorSubject<Offer[]>([...OFFERS]);
  offers$: Observable<Offer[]> = this.offersSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  fetchOffers() {
    // si mock = true
    //    agafa les ofertes mock i les desa com a offerSubject
    // si mock = false ---->
    // si està autenticat, crida a backend
    // si no, crida indexedDB
    // desa totes les ofertes com a offersSubject
  }

  addOffer(offer: Offer) {
    const currentOffers = this.offersSubject.value;
    this.offersSubject.next([...currentOffers, offer]);
    // si mock = false ------------
    // si està autenticat, desa l'oferta a backend
    // si no, la desa a indexedDB
  }

  updateOffer(index: number, offer: Offer) {
    //actualitza la oferta al behaviourSubject
    // si mock = false ------------
    //si està autenticat, actualitza la oferta al backend
    // si no, actualitza la oferta a indexedDB
  }

  deleteOffer(index: number) {
    //actualitza la oferta al behaviourSubject
    // si mock = false ------------
    //si està autenticat, actualitza la oferta al backend
    // si no, actualitza la oferta a indexedDB
  }
}
