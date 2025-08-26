import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Offer } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {

  private viewingOfferSubject = new BehaviorSubject<Offer | undefined>(undefined);
  viewingOffer$: Observable<Offer | undefined> = this.viewingOfferSubject.asObservable();

  openOfferDetail(offer: Offer | undefined) {
    this.viewingOfferSubject.next(offer);
  }

  closeOfferDetail(){
    this.viewingOfferSubject.next(undefined);
  }
}
