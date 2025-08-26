import { Component, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { combineLatest, debounceTime, map, Observable, startWith, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { ResponsesService } from '../../services/responses.service';
import { LlmService } from '../../services/llm.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../services/modals.service';
import { Offer, Response, TextSource, tResponseType } from '../../models/models';
import { OffersService } from '../../services/offers.service';
import { TextSourceService } from '../../services/textSources.service';

@Component({
  selector: 'app-response-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <input [formControl]="llmControl" placeholder="Type something..." />

    <form [formGroup]="responseForm" (ngSubmit)="onSubmit()"> 

      <select formControlName="type">
        <option value="interview">Interview</option>
        <option value="assignment">Assignment</option>
        <option value="contract">Contract</option>
        <option value="rejection">Rejection</option>
      </select>

      <input formControlName="date" type="date" placeholder="Date" />

      <!-- Aquí pots mostrar o seleccionar l'offer associada -->
    <select formControlName="offerId">
      <option *ngFor="let offer of sortedOffers$ | async" [value]="offer.id">
        {{ offer.role }} at {{ offer.company }} | {{ offer.createdAt | date:'shortDate' }}
      </option>
    </select>

      <button type="button" (click)="onClose()">Cancel</button>
      <button [disabled]="!responseForm.valid" type="submit">
        Create Response
      </button>
    </form>
    <hr>
  `,
  styles: ``
})
export class ResponseFormComponent {
  responseForm: FormGroup;
  llmControl: FormControl = new FormControl();
  textSource$: Observable<string> = this.llmControl.valueChanges.pipe(
    debounceTime(700),
  );

  sortedOffers$: Observable<Offer[]>;

  constructor(
    private fb: FormBuilder,
    private responsesService: ResponsesService,
    private llmService: LlmService,
    private destroyRef: DestroyRef,
    private modalService: ModalService,
    private offersService: OffersService,
    private textSourceService: TextSourceService
  ) {
    this.responseForm = this.fb.group({
      id: uuidv4(),
      type: ['', Validators.required],
      date: [undefined],
      createdAt: [new Date()],
      company: [''],
      offerId: ['', Validators.required] // aquí tens l’oferta associada
    });
    
    const companyControl = this.responseForm.get('company');

    this.sortedOffers$ = combineLatest([
      this.offersService.offers$,
      companyControl!.valueChanges.pipe(startWith(companyControl!.value))
    ]).pipe(
      map(([offers, company]) =>
        [...offers].sort(
          (a, b) => this.similarity(b.company ?? '', company) - this.similarity(a.company ?? '', company)
        )
      )
    );

  }

  ngOnInit(): void {
    this.textSource$
      .pipe(
        switchMap(text => this.llmService.promptResponse(text)), // igual que promptOffer, però adaptat
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(parsed => {
        this.responseForm.patchValue(parsed);
      });
  }

  onSubmit() {
    this.responsesService.addResponse(this.responseForm.value as Response);
    this.textSourceService.addTextSource({
    content: this.llmControl.value, 
    offerId: this.responseForm.value.id });
    this.llmControl.reset();
    this.modalService.close();

  }

  onClose() {
    this.modalService.close();
  }

  damerauLevenshtein(a: string, b: string): number {
    const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,        // eliminació
        dp[i][j - 1] + 1,        // inserció
        dp[i - 1][j - 1] + cost  // substitució
      );

      // Transposició
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
      }
    }
  }

  return dp[a.length][b.length];
}

similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;

  const dist = this.damerauLevenshtein(a.toLowerCase(), b.toLowerCase());
  const maxLen = Math.max(a.length, b.length);
  return 1 - dist / maxLen; // 0 = diferents, 1 = iguals
}
}
