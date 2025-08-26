import { Component, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, Observable, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { CommentsService } from '../../services/comments.service';
import { LlmService } from '../../services/llm.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../services/modals.service';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <input [formControl]="llmControl" placeholder="Type something..." />

    <form [formGroup]="commentForm" (ngSubmit)="onSubmit()"> 

      <textarea formControlName="content" placeholder="Comment content"></textarea>

      <button type="button" (click)="onClose()">Cancel</button>
      <button [disabled]="!commentForm.valid" type="submit">
        Add Comment
      </button>
    </form>
    <hr>
  `,
  styles: `textarea { width: 100%; height: 100px; }`
})
export class CommentFormComponent {
  commentForm: FormGroup;
  llmControl: FormControl = new FormControl();
  textSource$: Observable<string> = this.llmControl.valueChanges.pipe(
    debounceTime(700),
  );

  constructor(
    private fb: FormBuilder,
    private commentsService: CommentsService,
    private llmService: LlmService,
    private destroyRef: DestroyRef,
    private modalService: ModalService
  ) {
    this.commentForm = this.fb.group({
      id: uuidv4(),
      content: ['', Validators.required],
      createdAt: [new Date()]
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.commentsService.addComment(this.commentForm.value.content);
    this.llmControl.reset();
    this.commentForm.reset({ id: uuidv4(), content: '', createdAt: new Date() });
  }

  onClose() {
    this.modalService.close();
  }
}
