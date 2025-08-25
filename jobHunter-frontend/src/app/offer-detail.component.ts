import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Offer } from './models/models';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-offer-detail',
  imports: [CommonModule],
  template: `
<div *ngIf="offer">
  <button (click)="updatingOffer.emit(offer.id)">update</button>
  <button (click)="deletedOffer.emit(offer.id)">delete</button>
  <button (click)="offer = undefined">close</button>

  <h3>{{ offer.company }} ({{ offer.role }})</h3>
  <p>Status: {{ offer.status }}</p>
  <p>Hired: {{ offer.hired ?? 'N/A' }}</p>
  <p>Location: {{ offer.location ?? 'N/A' }}</p>
  <p>Recruiter: {{ offer.recruiter ?? 'N/A' }}</p>
  <p>Platform: {{ offer.platform ?? 'N/A' }}</p>
  <p>Payment Type: {{ offer.paymentType }}</p>
  <p>Salary: {{ offer.salaryMinimum ?? 0 }} - {{ offer.salaryMaximum ?? 0 }}</p>
  <p>Weekly Hours: {{ offer.weeklyHours ?? 0 }}</p>
  <p>Duration (months): {{ offer.durationMonths ?? 'N/A' }}</p>
  <p>Experience: {{ offer.experienceMinimum ?? 0 }} - {{ offer.experienceMaximum ?? 0 }}</p>
  <p>Created At: {{ offer.createdAt | date:'medium' }}</p>

  <div *ngIf="offer.skills?.length">
    <strong>Skills:</strong> {{ offer.skills?.join(', ') }}
  </div>

  <div *ngIf="offer.responses?.length">
      <h4>Responses:</h4>
      <ul>
<!--          <li *ngFor="let r of offer.responses">{{ r.content }} ({{ r.createdAt | date:'short' }})</li> -->
      </ul>
  </div>

  <div *ngIf="offer.comments?.length">
    <h4>Comments:</h4>
    <ul>
<!--          <li *ngFor="let c of offer.comments">{{ c.user?.name }}: {{ c.message }}</li> -->
    </ul>
  </div>

  <div *ngIf="offer.textSource">
    <h4>Text Source:</h4>
<!--        <p>{{ offer.textSource.text }}</p> -->
  </div>

  <div *ngIf="offer.user">
    <h4>User:</h4>
<!--        <p>{{ offer.user.name }}</p> -->
  </div>

  <hr>
</div>
  `,
  styles: ``
})
export class OfferDetailComponent {
  @Input() offer: Offer | undefined;
  @Output() updatingOffer = new EventEmitter<string>;
  @Output() deletedOffer = new EventEmitter<string>;

  ngOnChanges(){
    console.log("changes", this.offer)
  }
}
