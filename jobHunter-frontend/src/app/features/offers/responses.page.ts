import { Component } from '@angular/core';
import { NgForOf, AsyncPipe } from "@angular/common";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { ResponsesService } from '../../services/responses.service';
import { Offer, Response, tResponseType, tStatus } from '../../models/models';
import { ModalService } from '../../services/modals.service';
import { OffersService } from '../../services/offers.service';
import { OfferDetailComponent } from './offer-detail.component';

@Component({
  selector: 'app-responses',
  imports: [NgForOf, AsyncPipe, ReactiveFormsModule],
  template: `
  <label>
    Sort:
    <select [formControl]="sortByControl">
      <option [ngValue]="'createdAt'">Date</option>
      <option [ngValue]="'type'">Type</option>
      <option [ngValue]="'recruiter'">Recruiter</option>
    </select>
  </label>

  <label>
    Filter by type:
    <select [formControl]="filterByTypeControl">
      <option [ngValue]="'all'">All</option>
      <option [ngValue]="'interview'">Interview</option>
      <option [ngValue]="'assignment'">Assignment</option>
      <option [ngValue]="'contract'">Contract</option>
      <option [ngValue]="'rejection'">Rejection</option>
    </select>
  </label>

  <input type="text" [formControl]="searchControl" placeholder="Search responses..." />

  <button (click)="resetFilters()">clear filters</button>

  <table class="table">
    <thead>
      <tr>
        <th>Offer</th>
        <th>Type</th>
        <th>Recruiter</th>
        <th>Email</th>
        <th>Telephone</th>
        <th>Date</th>
        <th>Created At</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      <tr *ngFor="let response of filteredResponses$ | async">
          <td>{{ response.offer?.company || '—' }} | {{ response.offer?.role }}</td>
        <td>{{ response.type }}</td>
        <td>{{ response.recruiter }}</td>
        <td>{{ response.email }}</td>
        <td>{{ response.telephone }}</td>
        <td>{{ response.date }}</td>
        <td>{{ response.createdAt }}</td>
        <td>
          <button (click)="openDetails(response.offer)">View</button>
          <button (click)="responsesService.deleteResponse(response.id)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
  `,
  styles: ``
})
export class ResponsesPage {

  sortByControl = new FormControl<'createdAt' | 'type' | 'recruiter' | undefined>('createdAt');
  filterByTypeControl = new FormControl<tResponseType | 'all'>('all');
  searchControl = new FormControl('');

  filteredResponses$: Observable<any[]>;

  constructor(
    public responsesService: ResponsesService,
    public modalService: ModalService,
    public offersService: OffersService
  ) {
   this.filteredResponses$ = combineLatest([
  this.responsesService.responses$,
  this.offersService.offers$,
  this.sortByControl.valueChanges.pipe(startWith(this.sortByControl.value)),
  this.filterByTypeControl.valueChanges.pipe(startWith(this.filterByTypeControl.value)),
  this.searchControl.valueChanges.pipe(startWith(this.searchControl.value))
]).pipe(
  map(([responses, offers, sortBy, filterType, search]) => {
    // "Join" response + offer
    const responsesWithOffer = responses.map(r => ({
      ...r,
      offer: offers.find(o => o.id === r.offerId)
    }));

    let result = this.filterResponses(responsesWithOffer, filterType!, search!);
    return this.sortResponses(result, sortBy!);
  })
);

  }

  resetFilters() {
    this.sortByControl.setValue('createdAt');
    this.filterByTypeControl.setValue('all');
    this.searchControl.setValue('');
  }

  openDetails(offer: Offer) {
    this.modalService.open(OfferDetailComponent,  { offer: offer })
  }


  private filterResponses(responses: Response[], filterType: tResponseType | 'all', search: string): Response[] {
    let result = [...responses];
    if (filterType !== 'all') {
      result = result.filter(r => r.type === filterType);
    }
    if (search?.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(r =>
        r.recruiter?.toLowerCase().includes(searchLower) ||
        r.email?.toLowerCase().includes(searchLower) ||
        r.telephone?.toLowerCase().includes(searchLower)
      );
    }
    return result;
  }

  private sortResponses(responses: Response[], sortBy: string | undefined): Response[] {
    if (!sortBy) return responses;
    return [...responses].sort((a, b) => {
      switch (sortBy) {
        case 'type': return a.type.localeCompare(b.type);
        case 'recruiter': return a.recruiter.localeCompare(b.recruiter);
        case 'createdAt': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return 0;
      }
    });
  }
}
