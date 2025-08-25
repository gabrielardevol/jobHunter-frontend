import { Component, EventEmitter, Output } from '@angular/core';
import { OffersService } from './services/offers.service';
import { NgForOf } from "@angular/common";
import { AsyncPipe } from "@angular/common";
import { Offer } from './models/models';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-offers',
  imports: [NgForOf, AsyncPipe, ReactiveFormsModule],
  template: `

    <select [formControl]="sortByControl">
      <option [ngValue]="'company'">Company</option>
      <option [ngValue]="'createdAt'">Date</option>
      <option [ngValue]="'salaryMax'">Salary Max</option>
    </select>

    <select [formControl]="filterByStatusControl">
      <option [ngValue]="'all'">All</option>
      <option [ngValue]="'waiting'">waiting</option>
      <option [ngValue]="'expired'">expired</option>
      <option [ngValue]="'rejected'">rejected</option>
      <option [ngValue]="'onProcess'">onProcess</option>
      <option [ngValue]="'contract'">contract</option>
      <option [ngValue]="'dumped'">dumped</option>
    </select>

    <input type="text" [formControl]="searchControl" placeholder="Search offers..." />

    <button (click)="sortByControl.setValue(undefined); filterByStatusControl.setValue('all'); searchControl.setValue('')">clear filters</button>

    <div  *ngFor="let offer of filteredOffers$ | async" >
      {{offer.company}}
      {{offer.role}}
      {{offer.recruiter}}
      {{offer.skills}}
      {{offer.status}}
      <button (click)="viewingOffer.emit(offer)">view</button>
      <button (click)="updatingOffer.emit(offer.id)">update</button>
      <button (click)="deletedOffer.emit(offer.id)">delete</button>
      <hr>
    </div>

  `,
  styles: ``
})
export class OffersPage {
  @Output() updatingOffer = new EventEmitter<string>;
  @Output() deletedOffer = new EventEmitter<string>;
  @Output() viewingOffer = new EventEmitter<Offer>;
  sortByControl = new FormControl<undefined | 'company' | 'createdAt' | 'salaryMax'>('createdAt');
  filterByStatusControl = new FormControl<'waiting' | 'expired' | 'rejected' | 'onProcess' | 'contract' | 'dumped' | 'all'>('all');
  searchControl = new FormControl('');
  filteredOffers$: Observable<Offer[]>;
  
  constructor(public offersService: OffersService) {
    this.filteredOffers$ = combineLatest([
      this.offersService.offers$,
      this.sortByControl.valueChanges.pipe(startWith(this.sortByControl.value)),
      this.filterByStatusControl.valueChanges.pipe(startWith(this.filterByStatusControl.value)),
      this.searchControl.valueChanges.pipe(startWith(this.searchControl.value))
    ]).pipe(
      map(([offers, sortBy, filterStatus, search]) => {
        let result = [...offers];

        if (filterStatus !== 'all') {
          result = result.filter(o => o.status == filterStatus);
        }

        if (search?.trim()) {
          const searchLower = search.toLowerCase();
          result = result.filter(o =>
            o.company.toLowerCase().includes(searchLower) ||
            o.role.toLowerCase().includes(searchLower)
          );
        }

        if (sortBy) {
          result.sort((a, b) => {
            if (sortBy === 'company') return a.company.localeCompare(b.company);
            if (sortBy === 'createdAt') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === 'salaryMax') return (a.salaryMaximum ?? 0) - (b.salaryMaximum ?? 0);
            return 0;
          });
        }

        return result;
      })
    );    
  }
}
