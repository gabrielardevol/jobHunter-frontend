import { Component, Input } from '@angular/core';
import { Offer, TextSource, Response } from '../../models/models';
import { CommonModule } from '@angular/common';
import { OffersService } from '../../services/offers.service';
import { Observable } from 'rxjs';
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

    <button (click)="offerService.deleteOffer(offer.id); modalService.close()">delete</button>
    <button (click)="modalService.close()">
      {{ pendingChanges() ? 'close without saving' : 'close'}}
    </button>

    <h3>{{ offer.company }} - {{ offer.role }}</h3> 
    <span>{{ offer!.createdAt | date:'medium' }}</span>
    <select name="" id="" [(ngModel)]="editableOffer.status">
      <option *ngFor="let state of environment.offerStates" value={{state}}>{{state}}</option>
    </select> 

    <details>
      <summary>details / update</summary>
        <label>
          Location: <input [(ngModel)]="editableOffer.location" placeholder="not specified"/>
        </label>

        <label>
          Recruiter: <input [(ngModel)]="editableOffer.recruiter" placeholder="not specified"/>
        </label>

        <label>
          Platform: <input [(ngModel)]="editableOffer.platform" placeholder="not specified"/>
        </label>

        <legend>Payment Type</legend>
        <label *ngFor="let type of  ['hour', 'day', 'month', 'year'];">
          <input type="radio" name="paymentType" [value]="type" [(ngModel)]="editableOffer.paymentType"/>
          {{ type }}
        </label>

        <label>
          Salary Minimum: <input type="number" [(ngModel)]="editableOffer.salaryMinimum" placeholder="not specified"/>
        </label>

        <label>
          Salary Maximum: <input type="number" [(ngModel)]="editableOffer.salaryMaximum" placeholder="not specified"/>
        </label>

        <label>
          Weekly Hours: <input type="number" [(ngModel)]="editableOffer.weeklyHours" placeholder="not specified"/>
        </label>

        <label>
          Duration (months): <input type="number" [(ngModel)]="editableOffer.durationMonths" placeholder="not specified"/>
        </label>

        <label>
          Experience Minimum: <input type="number" [(ngModel)]="editableOffer.experienceMinimum" placeholder="not specified"/>
        </label>

        <label>
          Experience Maximum: <input type="number" [(ngModel)]="editableOffer.experienceMaximum" placeholder="not specified"/>
        </label>

        <label>
          Skills: <input type="text" [(ngModel)]="editableOffer.skills" placeholder="not specified" />
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
      <ng-container *ngFor="let response of responses$ | async">
        {{ response.type }} | {{ response.createdAt | date:'short' }}
       
        <ng-container *ngIf="textSourceService.getResponseTextSource(response.id) | async as textSource">
          <p>{{ textSource.content }}</p>
        </ng-container>
        <hr>   
      </ng-container>  
    </details>
    
    <app-comment-form [offerId]="offer.id"></app-comment-form>
  `,
  styles: `label {display: block;}`
})


export class OfferDetailComponent {
  @Input() offer!: Offer;
  editableOffer!: Offer;
  textSource$?: Observable<TextSource | undefined>;
  responses$?: Observable<Response[] | undefined>;
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
    this.editableOffer = Object.assign({}, this.offer);
  }

  saveChanges() {
    this.offerService.updateOffer(this.editableOffer.id, this.editableOffer);
    this.offer = Object.assign({}, this.editableOffer);
  }

  pendingChanges(): boolean {
    return JSON.stringify(this.editableOffer) !== JSON.stringify(this.offer);
  }
}
