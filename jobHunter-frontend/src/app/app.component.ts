import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OffersComponent } from './offers.component';
import { OfferFormComponent } from "./offer-form.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OffersComponent, OfferFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'jobHunter-frontend';
  selectedOffer: string | undefined = undefined;
}
