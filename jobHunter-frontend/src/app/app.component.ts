import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OffersComponent } from './offers.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OffersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'jobHunter-frontend';
}
