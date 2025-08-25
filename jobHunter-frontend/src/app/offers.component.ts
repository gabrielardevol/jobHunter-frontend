import { Component, EventEmitter, Output } from '@angular/core';
import { OffersService } from './services/offers.service';
import { NgForOf } from "@angular/common";
import { AsyncPipe } from "@angular/common";
import { Offer } from './models/models';

@Component({
  selector: 'app-offers',
  imports: [NgForOf, AsyncPipe],
  template: `
    <div  *ngFor="let offer of offersService.offers$ | async" >
      {{offer.company}}
      {{offer.role}}
      {{offer.recruiter}}
      {{offer.skills}}
      <button (click)="viewingOffer.emit(offer)">view</button>
      <button (click)="updatingOffer.emit(offer.id)">update</button>
      <button (click)="deletedOffer.emit(offer.id)">delete</button>
      <hr>
    </div>

  `,
  styles: ``
})
export class OffersComponent {
  @Output() updatingOffer = new EventEmitter<string>;
  @Output() deletedOffer = new EventEmitter<string>;
  @Output() viewingOffer = new EventEmitter<Offer>;

  constructor(public offersService: OffersService) {
      
  }
}
