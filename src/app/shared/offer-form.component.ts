import { Component, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { OffersService } from '../core/services/offers.service';
import { catchError, debounceTime, filter, Observable, switchMap, tap, throwError } from 'rxjs';
import { LlmService } from '../core/services/llm.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TextSourceService } from '../core/services/textSources.service';
import { v4 as uuidv4 } from 'uuid';
import { ModalService } from '../core/services/modals.service';

@Component({
  selector: 'app-offer-form',
  imports: [ReactiveFormsModule, CommonModule],
  template: `

    <input [formControl]="llmControl" placeholder="copy-paste offer description"/>
    <span *ngIf="isLoading">Processing...</span>

    <form [formGroup]="offerForm" (ngSubmit)="onSubmit(); modalService.close()"> 
    
      <label>
        Company <input formControlName="company" placeholder="Company" aria-required="true" />
      </label>

      <label>
        Role
        <select formControlName="role">
          <option value="frontend">frontend</option>
          <option value="backend">backend</option>
          <option value="fullstack">fullstack</option>
          <option value="others">others</option>
        </select>
      </label>

      <label>
        Location <input formControlName="location" placeholder="Location" />
      </label>

      <label>
        Recruiter <input formControlName="recruiter" placeholder="Recruiter" />
      </label>

      <label>
        Skills <input formControlName="skills" placeholder="Skills" />
      </label>

      <label>
        Platform <input formControlName="platform" placeholder="Platform" />
      </label>

      <label>
        Payment Type <select formControlName="paymentType">
          <option value="month">month</option>
          <option value="hour">hour</option>
          <option value="year">year</option>
          <option value="day">day</option>
        </select>
      </label>

      <label>
        Minimum Salary <input formControlName="salaryMinimum" type="number" placeholder="Min per hour" />
      </label>

      <label>
        Maximum Salary <input formControlName="salaryMaximum" type="number" placeholder="Max per hour" />
      </label>

      <label>
        Weekly Hours <input formControlName="weeklyHours" type="number" placeholder="Weekly hours" />
      </label>

      <label>
        Duration (months) <input formControlName="duration" type="number" placeholder="Duration in months" />
      </label>

      <label>
        Minimum Experience <input formControlName="experienceMinimum" type="number" placeholder="Min experience" />
      </label>

      <label>
        Maximum Experience <input formControlName="experienceMaximum" type="number" placeholder="Max experience" />
      </label>

      <button type="button" (click)="modalService.close()">Cancel</button>
      <button [disabled]="!offerForm.valid" type="submit">Create Offer</button>
      
    </form>
  `,

  styles: ``
})
export class OfferFormComponent {
  offerForm: FormGroup;
  llmControl: FormControl = new FormControl;
  isLoading: boolean = false;
  
  constructor(
    private fb: FormBuilder, 
    public textSourceService: TextSourceService, 
    public offersService: OffersService, 
    public llmService: LlmService, 
    private destroyRef: DestroyRef,
    public modalService: ModalService
  ) {
    this.offerForm = this.buildForm();
  }

  ngOnInit(): void {
    this.llmControl.valueChanges.pipe(
      debounceTime(500),
      filter(text => text && text.trim().length > 0),
      tap(() => this.isLoading = true),
      switchMap(text => this.llmService.promptOffer(text)),
      takeUntilDestroyed(this.destroyRef),
      tap(parsed => { 
        this.offerForm.patchValue(parsed);
        this.isLoading = false;
      }),
      catchError(err => {
        this.isLoading = false;
        return throwError(() => err)
      })
    ).subscribe();
  }

  onSubmit() {
    const offer = { ...this.offerForm.value, id: uuidv4() };

    this.offersService.addOffer(offer);
    this.textSourceService.addTextSource({
      content: this.llmControl.value, 
      offerId: offer.id 
    });
    this.llmControl.reset();
    this.offerForm.reset()
  }

  buildForm() {
    return this.fb.group({
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
      duration: [null],
      experienceMinimum: [0, Validators.min(0)],
      experienceMaximum: [0, Validators.min(0)],
    })
  }
}
