import { Component, DestroyRef, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { OffersService } from './services/offers.service';
import { debounceTime, Observable, switchMap, tap } from 'rxjs';
import { LlmService } from './services/llm.service';
import { v4 as uuidv4 } from 'uuid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offer-form',
  imports: [ReactiveFormsModule, CommonModule ],
  template: `
    <input *ngIf="offerId == undefined" [formControl]="llmControl" placeholder="Type something..." />

    <form [formGroup]="offerForm" (ngSubmit)="offerId ?
    offersService.updateOffer(offerId, offerForm.value) :
    offersService.addOffer(offerForm.value);  
    offerForm.reset(); offerId = undefined;
    "> 
    
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

      <button [disabled]="!offerForm.valid" type="submit">
        {{ offerId ? 'Update Offer' : 'Create Offer'}}
      </button>
    </form>
  `,

  styles: ``
})
export class OfferFormComponent {
  @Input() offerId: string | undefined; //used as 'update'
  offerForm: FormGroup;
  llmControl: FormControl = new FormControl;
  textSource$: Observable<string> = this.llmControl.valueChanges.pipe(
    debounceTime(1000),
//    tap(value => console.log('Valor actual del control:', value))
  );
  
  constructor(private fb: FormBuilder, public offersService: OffersService, public llmService: LlmService, private destroyRef: DestroyRef) {
//    console.log('offerId from offer-form', this.offerId);
    this.offerForm = this.fb.group({
      id: [uuidv4()],
      company: ['', Validators.required],
      role: ['', Validators.required],
      location: [''],
      recruiter: [''],
      status: ['waiting'], //move to business logic
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
     this.textSource$
    .pipe(
      switchMap(text => this.llmService.promptOffer(text)),
//      tap(value => console.log('Valor actual del control:', value)),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(parsed => this.offerForm.patchValue(parsed));
  }

  ngOnChanges(){
      this.offerForm.reset();
     if (this.offerId) {
      this.offersService.getOffer(this.offerId).subscribe(
        res => { console.log(res); res ? this.offerForm.patchValue(res) : null }
      )
    }
  }

}
