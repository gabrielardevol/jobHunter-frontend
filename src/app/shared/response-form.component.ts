import { Component, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, debounceTime, filter, map, Observable, startWith, switchMap, tap, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponsesService } from '../core/services/responses.service';
import { LlmService } from '../core/services/llm.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../core/services/modals.service';
import { Offer, Response } from '../core/models/models';
import { OffersService } from '../core/services/offers.service';
import { TextSourceService } from '../core/services/textSources.service';

@Component({
  selector: 'app-response-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `

<input [formControl]="llmControl" placeholder="Copy-paste response" aria-label="Paste response text" />
<span *ngIf="isLoading" aria-live="polite">Processing...</span>

<form [formGroup]="responseForm" (ngSubmit)="onSubmit()">

  <label>
    Type:
    <select formControlName="type" aria-required="true">
      <option value="interview">Interview</option>
      <option value="assignment">Assignment</option>
      <option value="contract">Contract</option>
      <option value="rejection">Rejection</option>
    </select>
  </label>

  <label>
    Recruiter:
    <input formControlName="recruiter" type="text" />
  </label>
  
  <label>
    Email:
    <input formControlName="email" type="text" />
  </label>
  
  <label>
    Telephone:
    <input formControlName="telephone" type="text" />
  </label>

  <label>
    Date:
    <input formControlName="date" type="date" placeholder="Date" [attr.aria-required]="responseForm.get('type')?.value === 'interview' || responseForm.get('type')?.value === 'assignment'" />
  </label>

  <label>
    Offer:
    <select formControlName="offerId" aria-required="true">
      <option *ngFor="let offer of sortedOffers$ | async" [value]="offer.id">
        {{ offer.role }} at {{ offer.company }} | {{ offer.createdAt | date:'shortDate' }}
      </option>
    </select>
  </label>

  <button type="button" (click)="onClose()">Cancel</button>
  <button [disabled]="!responseForm.valid" type="submit">Create Response</button>
</form>
  `,
  styles: ``
})
export class ResponseFormComponent {
  responseForm: FormGroup;
  llmControl: FormControl = new FormControl();
  sortedOffers$: Observable<Offer[]>;
  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private responsesService: ResponsesService,
    private llmService: LlmService,
    private destroyRef: DestroyRef,
    private modalService: ModalService,
    private offersService: OffersService,
    private textSourceService: TextSourceService
  ) {
    this.responseForm = this.buildForm();

    const companyControl = this.responseForm.get('company');

    this.sortedOffers$ = combineLatest([
      this.offersService.offers$,
      companyControl!.valueChanges.pipe(startWith(companyControl!.value))
    ]).pipe(
      map(([offers, company]) =>
        [...offers].sort(
          (a, b) => this.similarity(b.company ?? '', company) - this.similarity(a.company ?? '', company)
        )
      ),
      tap(sortedOffers => {
        const companyValue = companyControl!.value;
        if (companyValue && companyValue.trim() !== '') {
          const firstOffer = sortedOffers[0];
          if (firstOffer) {
            this.responseForm.get('offerId')?.setValue(firstOffer.id, { emitEvent: false });
          }
        }
      })
    );
  }

  ngOnInit(): void {
    this.llmControl.valueChanges.pipe(
      debounceTime(500),
      filter(text => text && text.trim().length > 0),
      tap(() => this.isLoading = true),
      switchMap(text => this.llmService.promptResponse(text)),
      takeUntilDestroyed(this.destroyRef),
      tap(parsed => {
        this.responseForm.patchValue(parsed);
        this.isLoading = false;
      }),
      catchError(err => {
        this.isLoading = false;
        return throwError(() => err)
      })
    ).subscribe();
  }

  onSubmit() {
    const response: Response = { ...this.responseForm.value, id: uuidv4(), createdAt: new Date() };
    this.responsesService.addResponse(response);

    this.textSourceService.addTextSource({
      content: this.llmControl.value,
      responseId: response.id
    });

    this.llmControl.reset();
    this.responseForm.reset();
    this.modalService.close();
  }

  onClose() {
    this.modalService.close();
  }

  private buildForm() {
    return this.fb.group({
      type: ['', Validators.required],
      date: [undefined],
      company: [''],
      email:  [''],
      telephone:  [''],
      recruiter: [''],
      offerId: ['', Validators.required]
    }, { validators: this.dateRequiredIfNeeded });
  }

  private dateRequiredIfNeeded(formGroup: FormGroup) {
    const type = formGroup.get('type')?.value;
    const date = formGroup.get('date')?.value;
    return (type === 'interview' || type === 'assignment') && !date ? { dateRequired: true } : null;
  }

  // === Similarity / Damerau-Levenshtein functions ===
  private damerauLevenshtein(a: string, b: string): number {
    const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
        }
      }
    }
    return dp[a.length][b.length];
  }

  private similarity(a: string, b: string): number {
    if (!a && !b) return 1;
    if (!a || !b) return 0;
    const dist = this.damerauLevenshtein(a.toLowerCase(), b.toLowerCase());
    return 1 - dist / Math.max(a.length, b.length);
  }
}