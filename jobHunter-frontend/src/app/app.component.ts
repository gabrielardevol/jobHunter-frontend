import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OffersComponent } from './offers.component';
import { OfferCreationComponent } from "./offer-creation/offer-creation.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OffersComponent, OfferCreationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'jobHunter-frontend';
}
