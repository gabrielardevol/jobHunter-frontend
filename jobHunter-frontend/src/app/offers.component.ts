import { Component, EventEmitter, Output } from '@angular/core';
import { OffersService } from './services/offers.service';
import { NgForOf } from "@angular/common";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: 'app-offers',
  imports: [NgForOf, AsyncPipe],
  template: `
    <div  *ngFor="let offer of offersService.offers$ | async"
    (click)="this.selectedOffer.emit(offer.id)">
      {{offer.company}}
      {{offer.role}}
      {{offer.recruiter}}
      {{offer.skills}}
      <hr>
    </div>

  `,
  styles: ``
})
export class OffersComponent {
  @Output() selectedOffer = new EventEmitter<string>;
  constructor(public offersService: OffersService) {

  }
}
