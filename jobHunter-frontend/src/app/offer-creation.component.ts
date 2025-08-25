import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { OffersService } from './services/offers.service';
import { debounceTime, Observable } from 'rxjs';
import { LlmService } from './services/llm.service';

@Component({
  selector: 'app-offer-creation',
  imports: [ReactiveFormsModule ],
  template: `
     <input [formControl]="llmControl" placeholder="Type something..." />

    <form [formGroup]="offerForm" (ngSubmit)="offersService.addOffer(offerForm.value); offerForm.reset()"> 
 <input formControlName="company" placeholder="Company" />
  
  <select formControlName="role">
    <option value="frontend">frontend</option>
    <option value="backend">backend</option>
    <option value="fullstack">fullstack</option>
    <option value="others">others</option>
  </select>
  
  <input formControlName="location" placeholder="Location" />
  <input formControlName="recruiter" placeholder="Recruiter" />

  <input formControlName="platform" placeholder="Platform" />

  <input formControlName="perHoursMinimum" type="number" placeholder="Min per hour" />
  <input formControlName="perHoursMaximum" type="number" placeholder="Max per hour" />
  <input formControlName="weeklyHours" type="number" placeholder="Weekly hours" />
  <input formControlName="duration" type="number" placeholder="Duration in months" />
  <input formControlName="experienceMinimum" type="number" placeholder="Min experience" />
  <input formControlName="experienceMaximum" type="number" placeholder="Max experience" />

  <button [disabled]="!offerForm.valid" type="submit">Create Offer</button>
    </form>
  `,
  styles: ``
})
export class OfferCreationComponent {
  offerForm: FormGroup;
  llmControl: FormControl = new FormControl;
  textSource$: Observable<string> = this.llmControl.valueChanges.pipe(
    debounceTime(1000),
  );
  
  constructor(private fb: FormBuilder, public offersService: OffersService, public llmService: LlmService) {
    this.offerForm = this.fb.group({
      company: ['', Validators.required],
      role: ['', Validators.required],
      location: [''],
      recruiter: [''],
      status: ['waiting'],
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

    this.textSource$.subscribe(response => {
        this.llmService.promptOffer(response)
        //must subscribe to promptOffer
        //must cast response when received
    })
   }

  ngOnInit(): void {
    
  }

}
