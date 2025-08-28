import { Component } from '@angular/core';
import { OffersService } from '../../core/services/offers.service';
import { NgForOf } from "@angular/common";
import { AsyncPipe } from "@angular/common";
import { Offer } from '../../core/models/models';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { ModalService } from '../../core/services/modals.service';
import { OfferDetailComponent } from './offer-detail.component';

@Component({
  selector: 'app-offers',
  imports: [NgForOf, AsyncPipe, ReactiveFormsModule],
  template: `

  <label>
    Sort:
    <select [formControl]="sortByControl">
      <option [ngValue]="'company'">Company</option>
      <option [ngValue]="'createdAt'">Date</option>
      <option [ngValue]="'salaryMax'">Salary Max</option>
    </select>
  </label>

  <label>
    Filter:
    <select [formControl]="filterByStatusControl">
      <option [ngValue]="'all'">All</option>
      <option [ngValue]="'waiting'">waiting</option>
      <option [ngValue]="'expired'">expired</option>
      <option [ngValue]="'rejected'">rejected</option>
      <option [ngValue]="'onProcess'">onProcess</option>
      <option [ngValue]="'contract'">contract</option>
      <option [ngValue]="'dumped'">dumped</option>
    </select>
  </label>

  <input type="text" [formControl]="searchControl" placeholder="Search offers..." />

  <button (click)="sortByControl.setValue('createdAt'); filterByStatusControl.setValue('all'); searchControl.setValue('')">clear filters</button>
  <table class="table">
    <thead>
      <tr>
        <th>Company</th>
        <th>Role</th>
        <th>Recruiter</th>
        <th>Skills</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      <tr *ngFor="let offer of filteredOffers$ | async">
        <td>{{ offer.company }}</td>
        <td>{{ offer.role }}</td>
        <td>{{ offer.recruiter }}</td>
        <td>{{ offer.skills }}</td>
        <td>{{ offer.status }}</td>
        <td>
          <button (click)="offersService.openDetails(offer.id)">View</button>
          <button (click)="offersService.deleteOffer(offer.id)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
  `,
  styles: ``
})
export class OffersPage {

  sortByControl = new FormControl<undefined | 'company' | 'createdAt' | 'salaryMax'>('createdAt');
  filterByStatusControl = new FormControl<'waiting' | 'expired' | 'rejected' | 'onProcess' | 'contract' | 'dumped' | 'all'>('all');
  searchControl = new FormControl('');
  filteredOffers$: Observable<Offer[]>;
  
  constructor(public offersService: OffersService, public modalService: ModalService,) {
    this.filteredOffers$ = combineLatest([
      this.offersService.offers$,
      this.sortByControl.valueChanges.pipe(startWith(this.sortByControl.value)),
      this.filterByStatusControl.valueChanges.pipe(startWith(this.filterByStatusControl.value)),
      this.searchControl.valueChanges.pipe(startWith(this.searchControl.value))
    ]).pipe(
      map(([offers, sortBy, filterStatus, search]) => {
        let result = this.filterOffers(offers, filterStatus!, search!);
        return this.sortOffers(result, sortBy!);
      })
    );    
  }

  private filterOffers(offers: Offer[], filterStatus: string, search: string): Offer[] {
    let result = [...offers];
    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }
    if (search?.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(o =>
        o.company.toLowerCase().includes(searchLower) ||
        o.role.toLowerCase().includes(searchLower)
      );
    }
    return result;
  }

  private sortOffers(offers: Offer[], sortBy: string | undefined): Offer[] {
    if (!sortBy) return offers;
    return [...offers].sort((a, b) => {
      switch (sortBy) {
        case 'company': return a.company.localeCompare(b.company);
        case 'createdAt': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'salaryMax': return (a.salaryMaximum ?? 0) - (b.salaryMaximum ?? 0);
        default: return 0;
      }
    });
  }
}
