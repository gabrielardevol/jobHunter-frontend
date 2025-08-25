import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Offer } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {

  private updatingOfferSubject = new BehaviorSubject<string | undefined>(undefined);
  updatingOffer$: Observable<string | undefined> = this.updatingOfferSubject.asObservable();

  private viewingOfferSubject = new BehaviorSubject<Offer | undefined>(undefined);
  viewingOffer$: Observable<Offer | undefined> = this.viewingOfferSubject.asObservable();

  constructor() {}

  setUpdatingOffer(id: string | undefined) {
    this.updatingOfferSubject.next(id);
  }

  setViewingOffer(offer: Offer | undefined) {
    this.viewingOfferSubject.next(offer);
  }
}
