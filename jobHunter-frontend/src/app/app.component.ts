import { Component } from '@angular/core';
import { RouterOutlet , RouterModule } from '@angular/router';
import { OffersPage } from './offers.page';
import { OfferFormComponent } from "./offer-form.component";
import { OffersService } from './services/offers.service';
import { OfferDetailComponent } from "./offer-detail.component";
import { NgIf } from "@angular/common";
import { Offer } from './models/models';
import { CommonModule } from '@angular/common';
import { GlobalStateService } from './services/global-state.store';
import { SnackbarService } from './services/snack.service';
import {v4 as uuidv4} from 'uuid';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, OfferFormComponent, CommonModule, OfferDetailComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  title = 'jobHunter-frontend';
  updatingOffer: string | undefined = undefined;
  viewingOffer: any;

  constructor(public offersService: OffersService, 
    public globalStateStore: GlobalStateService,
  public snackbarService: SnackbarService){}

  showTestSnackbar() {
    this.snackbarService.addSnackbar({
      id: uuidv4(),
      message: 'lorem',
      action: () => console.log('testing snackbar')
    });}
}
