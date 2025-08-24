import { Component } from '@angular/core';
import { OffersService } from './services/offers.service';
import { NgForOf } from "@angular/common";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: 'app-offers',
  imports: [NgForOf, AsyncPipe],
  template: `
    <p>
      offers works!
    </p>
    <div  *ngFor="let offer of offersService.offers$ | async">
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
  constructor(public offersService: OffersService) {

  }
}
