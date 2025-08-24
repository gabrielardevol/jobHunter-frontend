import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { OffersService } from '../services/offers.service';

@Component({
  selector: 'app-offer-creation',
  imports: [ReactiveFormsModule ],
  template: `
 
    <form [formGroup]="offerForm" (ngSubmit)="offersService.addOffer(offerForm.value)"> 
 <input formControlName="company" placeholder="Company" />
  
  <select formControlName="role">
    <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
  </select>
  
  <label>
    Hired:
    <input type="checkbox" formControlName="hired" />
  </label>
  
  <input formControlName="location" placeholder="Location" />
  <input formControlName="recruiter" placeholder="Recruiter" />

  <input formControlName="platform" placeholder="Platform" />

  <input formControlName="perHoursMinimum" type="number" placeholder="Min per hour" />
  <input formControlName="perHoursMaximum" type="number" placeholder="Max per hour" />
  <input formControlName="weeklyHours" type="number" placeholder="Weekly hours" />
  <input formControlName="duration" type="number" placeholder="Duration in months" />
  <input formControlName="experienceMinimum" type="number" placeholder="Min experience" />
  <input formControlName="experienceMaximum" type="number" placeholder="Max experience" />

  <button type="submit">Create Offer</button>
    </form>
  `,
  styles: ``
})
export class OfferCreationComponent {
  offerForm: FormGroup;

  constructor(private fb: FormBuilder, public offersService: OffersService) {
    this.offerForm = this.fb.group({
      company: ['', Validators.required],
      role: ['', Validators.required],
      hired: [false],
      location: [''],
      recruiter: [''],
      status: [''],
      platform: [''],
      skills: this.fb.array([]),
      perHoursMinimum: [0, Validators.min(0)],
      perHoursMaximum: [0, Validators.min(0)],
      weeklyHours: [0, Validators.min(0)],
      duration: [undefined],
      experienceMinimum: [0, Validators.min(0)],
      experienceMaximum: [0, Validators.min(0)],
      createdAt: [new Date()]
    });
   }

  ngOnInit(): void {
    
  }

}
