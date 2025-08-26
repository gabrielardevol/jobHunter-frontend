import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Offer, TextSource } from '../../models/models';
import { CommonModule } from '@angular/common';
import { GlobalStateService } from '../../services/global-state.store';
import { OffersService } from '../../services/offers.service';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { TextSourceService } from '../../services/textSource.service';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-offer-detail',
  imports: [CommonModule , FormsModule],
  template: `

  <div *ngIf="offer$ | async as offer">
    <button (click)="offerService.deleteOffer(offer!.id); globalStateStore.openOfferDetail(undefined)">delete</button>
    <button (click)="close()">{{ pendingChanges() ? 'close without saving' : 'close'}}</button>

    <h3>{{ offer!.company }} ({{ offer!.role }})</h3>     
    <p>Created At: {{ offer!.createdAt | date:'medium' }}</p>

    <p>status:<select name="" id="" [(ngModel)]="editableOffer!.status" (ngModelChange)="offerService.updateOffer(offer!.id, offer!)">
      <option *ngFor="let state of environment.offerStates" value={{state}}>{{state}}</option>
    </select></p>  
    
      <label>
        Location:
        <input [(ngModel)]="editableOffer!.location" />
      </label>

      <label>
        Recruiter:
        <input [(ngModel)]="editableOffer!.recruiter" />
      </label>

      <label>
        Platform:
        <input [(ngModel)]="editableOffer!.platform" />
      </label>

      <legend>Payment Type</legend>

      <label *ngFor="let t of  ['hour', 'day', 'month', 'year'];" style="margin-right: 1rem;">
        <input
          type="radio"
          name="paymentType"
          [value]="t"
          [(ngModel)]="editableOffer!.paymentType"
        />
        {{ t }}
      </label>

      <label>
        Salary Minimum:
        <input type="number" [(ngModel)]="editableOffer!.salaryMinimum" />
      </label>

      <label>
        Salary Maximum:
        <input type="number" [(ngModel)]="editableOffer!.salaryMaximum" />
      </label>

    <label>
      Weekly Hours:
      <input type="number" [(ngModel)]="editableOffer!.weeklyHours" />
    </label>
    <label>
      Duration (months):
      <input type="number" [(ngModel)]="editableOffer!.durationMonths" />
    </label>

    <label>
      Experience Minimum:
      <input type="number" [(ngModel)]="editableOffer!.experienceMinimum" />
    </label>

    <label>
      Experience Maximum:
      <input type="number" [(ngModel)]="editableOffer!.experienceMaximum" />
    </label>

    <label>
      Skills:
      <input type="text" [(ngModel)]="editableOffer!.skills" placeholder="skill1, skill2, ..." />
    </label>

    <button  [disabled]="!pendingChanges()" (click)="saveChanges()">Save changes</button>

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

    <div>
      <h4>Text Source:</h4>
      <p *ngIf="textSource$ | async as textSource">{{textSource!.content}}</p>
    </div>

    <hr>
  </div>

  `,
  styles: `label {display: block;}`
})
export class OfferDetailComponent {

  offer$: Observable<Offer | undefined>;
  editableOffer: Offer | null = null;
  originalOffer: Offer | null = null;
  textSource$?: Observable<TextSource | undefined>;
  environment = environment;

  constructor(
    public globalStateStore: GlobalStateService,
    public offerService: OffersService,
    public textSourceService: TextSourceService
  ) {
    this.offer$ = globalStateStore.viewingOffer$;

    this.offer$.pipe(
      filter((offer): offer is Offer => !!offer),
      tap(offer => {
        this.originalOffer = offer;
        this.editableOffer = { ...offer };
      }),
      switchMap(offer => this.textSourceService.getTextSource(offer.id)),
      tap(response => console.log(response))
    ).subscribe(response => {
      this.textSource$ = new Observable<TextSource | undefined>(observer => observer.next(response));
    });
  }

  saveChanges() {
    if (!this.editableOffer) return;
    this.offerService.updateOffer(this.editableOffer.id, this.editableOffer);
    this.originalOffer = { ...this.editableOffer };
  }

  close() {

    this.globalStateStore.openOfferDetail(undefined)
  }

  pendingChanges(): boolean {
    return JSON.stringify(this.editableOffer) !== JSON.stringify(this.originalOffer);
  }
}
