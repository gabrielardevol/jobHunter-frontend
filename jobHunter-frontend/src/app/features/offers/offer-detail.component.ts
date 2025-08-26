import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Offer, TextSource, Response } from '../../models/models';
import { CommonModule } from '@angular/common';
import { OffersService } from '../../services/offers.service';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { TextSourceService } from '../../services/textSources.service';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../services/modals.service';
import { ResponsesService } from '../../services/responses.service';
import { CommentFormComponent } from "./comment-form.component";

@Component({
  selector: 'app-offer-detail',
  imports: [CommonModule, FormsModule, CommentFormComponent],
  template: `

  <div *ngIf="offer && editableOffer">
    <button (click)="offerService.deleteOffer(offer!.id); close()">delete</button>
    <button (click)="close()">{{ pendingChanges() ? 'close without saving' : 'close'}}</button>

    <h3>{{ offer.company }} ({{ offer!.role }})</h3>     
    <p>Created At: {{ offer!.createdAt | date:'medium' }}</p>

    <p>status:<select name="" id="" [(ngModel)]="editableOffer.status">
      <option *ngFor="let state of environment.offerStates" value={{state}}>{{state}}</option>
    </select></p>  

    <details>
      <summary>details / update</summary>
      
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
    </details>

    <details>
      <summary>
       Text Source:
      </summary>     
      <p *ngIf="textSource$ | async as textSource">{{textSource!.content}}</p>
    
    </details>
                  
    <details>
      <summary>
        Responses
      </summary> 
      <li *ngFor="let response of responses$ | async">
        <p><b>Response ID:</b> {{ response.id }}</p>

        <ng-container *ngIf="getTextSourceForResponse(response.id) | async as textSource">
          <p><b>Content:</b> {{ textSource.content }}</p>
          <p><b>CreatedAt:</b> {{ textSource.createdAt | date:'short' }}</p>
        </ng-container>
      </li>
        
    </details>
    
    <div >

    
    <div *ngIf="offer!.comments?.length">
      <h4>Comments:</h4>
      <ul>
      </ul>
    </div>


    <app-comment-form [offerId]="offer.id"></app-comment-form>
    <hr>
  </div>

  `,
  styles: `label {display: block;}`
})
export class OfferDetailComponent {

  editableOffer: Offer | undefined;
  textSource$?: Observable<TextSource | undefined>;
  responses$?: Observable<Response[] | undefined>;

  @Input() offer: Offer | undefined;

  environment = environment;

  constructor(
    public offerService: OffersService,
    public textSourceService: TextSourceService,
    public modalService: ModalService,
    public responseService: ResponsesService
  ) {
  }
  
  ngOnInit() {
    this.textSource$ = this.textSourceService.getOfferTextSource(this.offer!.id);
    this.responses$ = this.responseService.getResponsesByOffer(this.offer!.id);
    this.responses$.subscribe(responses => {
      console.log('Responses changed:', responses);
    });
    this.editableOffer = Object.assign({}, this.offer);
  }

  saveChanges() {
    if (!this.editableOffer) return;
    this.offerService.updateOffer(this.editableOffer.id, this.editableOffer);
    this.offer = Object.assign({}, this.editableOffer);
  }

  close() {
    this.modalService.close()
  }

  pendingChanges(): boolean {
    return JSON.stringify(this.editableOffer) !== JSON.stringify(this.offer);
  }
    
  getTextSourceForResponse(responseId: string): Observable<TextSource | undefined> {
    return this.textSourceService.getResponseTextSource(responseId);
  }

  getTextSourceForOffer(offerId: string): Observable<TextSource | undefined> {
    return this.textSourceService.getOfferTextSource(offerId);
  }
}
