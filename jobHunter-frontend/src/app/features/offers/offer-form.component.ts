import { Component, DestroyRef, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { OffersService } from '../../services/offers.service';
import { debounceTime, Observable, of, switchMap, take, tap } from 'rxjs';
import { LlmService } from '../../services/llm.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, AsyncPipe } from '@angular/common';
import { GlobalStateService } from '../../services/global-state.store';
import { TextSourceService } from '../../services/textSource.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-offer-form',
  imports: [ReactiveFormsModule, CommonModule , AsyncPipe],
  template: `
    <input *ngIf="!(offerId$ | async)" [formControl]="llmControl" placeholder="Type something..." />

    <form [formGroup]="offerForm" (ngSubmit)="onSubmit()"> 
    
      <input formControlName="company" placeholder="Company" />
    
      <select formControlName="role">
        <option value="frontend">frontend</option>
        <option value="backend">backend</option>
        <option value="fullstack">fullstack</option>
        <option value="others">others</option>
      </select>
      
      <input formControlName="location" placeholder="Location" />
      <input formControlName="recruiter" placeholder="Recruiter" />
      <input formControlName="skills" placeholder="Skills" />
      <input formControlName="platform" placeholder="Platform" />
      <select formControlName="paymentType">
        <option value="month">month</option>
        <option value="hour">hour</option>
        <option value="year">year</option>
        <option value="day">day</option>
      </select>
      <input formControlName="salaryMinimum" type="number" placeholder="Min per hour" />
      <input formControlName="salaryMaximum" type="number" placeholder="Max per hour" />
      <input formControlName="weeklyHours" type="number" placeholder="Weekly hours" />
      <input formControlName="duration" type="number" placeholder="Duration in months" />
      <input formControlName="experienceMinimum" type="number" placeholder="Min experience" />
      <input formControlName="experienceMaximum" type="number" placeholder="Max experience" />

      <button type="button" (click)="globalStateStore.closeUpdateOffer(); closeCreateOffer.emit()">Cancel</button>
      <button [disabled]="!offerForm.valid" type="submit">
        {{ (offerId$ | async) ? 'Update Offer' : 'Create Offer'}}
      </button>
    </form>
    <hr>
  `,

  styles: ``
})
export class OfferFormComponent {
  @Output() closeCreateOffer = new EventEmitter<any>;
  offerId$: Observable<string | undefined>; //used as 'update'
  offerForm: FormGroup;
  llmControl: FormControl = new FormControl;
  textSource$: Observable<string> = this.llmControl.valueChanges.pipe(
    debounceTime(700),
  );
  
  constructor(private fb: FormBuilder, public textSourceService: TextSourceService, public globalStateStore: GlobalStateService, public offersService: OffersService, public llmService: LlmService, private destroyRef: DestroyRef) {
    this.offerForm = this.fb.group({
      id: uuidv4(),
      company: ['', Validators.required],
      role: ['', Validators.required],
      location: [''],
      recruiter: [''],
      platform: [''],
      skills: [''],
      paymentType: ['month'],
      salaryMinimum: [0, Validators.min(0)],
      salaryMaximum: [0, Validators.min(0)],
      weeklyHours: [0, Validators.min(0)],
      duration: [undefined],
      experienceMinimum: [0, Validators.min(0)],
      experienceMaximum: [0, Validators.min(0)],
    });

    this.offerId$ = globalStateStore.updatingOffer$;
  }

  ngOnInit(): void {

    this.offerId$
    .pipe(
      switchMap(id => id ? this.offersService.getOffer(id) : of(undefined)),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(res => {
      this.offerForm.reset();
      if (res) {
        this.offerForm.patchValue(res);
      }
    });

    this.textSource$
    .pipe(
      switchMap(text => this.llmService.promptOffer(text)),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(parsed => {
      this.offerForm.patchValue(parsed);
    });
  }

  onSubmit() {
    this.offerId$.pipe(take(1)).subscribe(offerId => {
      if (offerId) {
        this.offersService.updateOffer(offerId, this.offerForm.value);
      } else {
        this.offersService.addOffer(this.offerForm.value);
        this.textSourceService.addTextSource({
          content: this.llmControl.value, 
          entityId: this.offerForm.value.id 
        })
      }
      this.offerForm.reset();
    });

    this.globalStateStore.closeUpdateOffer();
    this.llmControl.reset();
  }
}
