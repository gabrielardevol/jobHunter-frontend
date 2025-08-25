import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Offer } from './models/models';
import { CommonModule } from '@angular/common';
import { GlobalStateService } from './services/global-state.store';
import { OffersService } from './services/offers.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-offer-detail',
  imports: [CommonModule],
  template: `

<div *ngIf="offer$ | async as offer">
  <button (click)="globalStateStore.setUpdatingOffer(offer!.id)">update</button>
  <button (click)="offerService.deleteOffer(offer!.id); globalStateStore.setViewingOffer(undefined)">delete</button>
  <button (click)="globalStateStore.setViewingOffer(undefined)">close</button>

  <h3>{{ offer!.company }} ({{ offer!.role }})</h3>
  <p>Status: {{ offer!.status }}</p>
  <p>Hired: {{ offer!.hired ?? 'N/A' }}</p>
  <p>Location: {{ offer!.location ?? 'N/A' }}</p>
  <p>Recruiter: {{ offer!.recruiter ?? 'N/A' }}</p>
  <p>Platform: {{ offer!.platform ?? 'N/A' }}</p>
  <p>Payment Type: {{ offer!.paymentType }}</p>
  <p>Salary: {{ offer!.salaryMinimum ?? 0 }} - {{ offer!.salaryMaximum ?? 0 }}</p>
  <p>Weekly Hours: {{ offer!.weeklyHours ?? 0 }}</p>
  <p>Duration (months): {{ offer!.durationMonths ?? 'N/A' }}</p>
  <p>Experience: {{ offer!.experienceMinimum ?? 0 }} - {{ offer!.experienceMaximum ?? 0 }}</p>
  <p>Created At: {{ offer!.createdAt | date:'medium' }}</p>

  <div *ngIf="offer!.skills?.length">
    <strong>Skills:</strong> {{ offer!.skills?.join(', ') }}
  </div>

  <div *ngIf="offer!.responses?.length">
    <h4>Responses:</h4>
    <ul>
    </ul>
  </div>

  <div *ngIf="offer!.comments?.length">
    <h4>Comments:</h4>
    <ul>
    </ul>
  </div>

  <div *ngIf="offer!.textSource">
    <h4>Text Source:</h4>
    <p>{{ offer!.textSource.content }}</p>
  </div>

  <hr>
</div>


  `,
  styles: ``
})
export class OfferDetailComponent {
  offer$: Observable<Offer | undefined>;
  //@Output() updatingOffer = new EventEmitter<string>;
  //@Output() deletedOffer = new EventEmitter<string>;

  constructor(public globalStateStore: GlobalStateService, public offerService: OffersService) {
    this.offer$ = globalStateStore.viewingOffer$
  }
}
