import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Offer } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {

  private offerToUpdateSubject = new BehaviorSubject<string | undefined>(undefined);
  updatingOffer$: Observable<string | undefined> = this.offerToUpdateSubject.asObservable();

  private viewingOfferSubject = new BehaviorSubject<Offer | undefined>(undefined);
  viewingOffer$: Observable<Offer | undefined> = this.viewingOfferSubject.asObservable();

  openUpdateOffer(id: string | undefined) {
    this.offerToUpdateSubject.next(id);
  }

  openOfferDetail(offer: Offer | undefined) {
    this.viewingOfferSubject.next(offer);
  }

  closeUpdateOffer(){
    this.offerToUpdateSubject.next(undefined);
  }

  closeOfferDetail(){
    this.viewingOfferSubject.next(undefined);
  }
}
