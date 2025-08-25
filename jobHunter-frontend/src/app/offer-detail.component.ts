import { Component, Input } from '@angular/core';
import { Offer } from './models/models';

@Component({
  selector: 'app-offer-detail',
  imports: [],
  template: `
    <p>
      {{offer.company}}
    </p>
  `,
  styles: ``
})
export class OfferDetailComponent {
  @Input() offer!: Offer;

  ngOnChanges(){
    console.log("changes", this.offer)
  }
}
