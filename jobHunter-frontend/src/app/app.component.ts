import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OffersPage } from './offers.page';
import { OfferFormComponent } from "./offer-form.component";
import { OffersService } from './services/offers.service';
import { OfferDetailComponent } from "./offer-detail.component";
import { NgIf } from "@angular/common";
import { Offer } from './models/models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OffersPage, OfferFormComponent, OfferDetailComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  title = 'jobHunter-frontend';
  updatingOffer: string | undefined = undefined;
  viewingOffer: any;

  constructor(public offersService: OffersService){}

}
