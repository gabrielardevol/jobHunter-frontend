import { Component, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, Observable, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { ResponsesService } from '../../services/response.service';
import { LlmService } from '../../services/llm.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../services/modal.service';
import { Response, tResponseType } from '../../models/models';

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
      <input formControlName="offer" placeholder="Offer ID" />

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

  constructor(
    private fb: FormBuilder,
    private responsesService: ResponsesService,
    private llmService: LlmService,
    private destroyRef: DestroyRef,
    private modalService: ModalService
  ) {
    this.responseForm = this.fb.group({
      id: uuidv4(),
      type: ['', Validators.required],
      date: [undefined],
      createdAt: [new Date()],
      offer: ['', Validators.required] // aquí tens l’oferta associada
    });
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
    this.llmControl.reset();
  }

  onClose() {
    this.modalService.close();
  }
}
