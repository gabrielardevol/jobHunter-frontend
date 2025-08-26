import { Component, DestroyRef, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, Observable, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from '../../models/models';
import { CommentsService } from '../../services/comments.service';
import { LlmService } from '../../services/llm.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../services/modals.service';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `


<form [formGroup]="commentForm" (ngSubmit)="onSubmit()"> 
  <textarea formControlName="content" placeholder="Comment content"></textarea>

  <div *ngIf="comments$ | async as comments">
    <ul>
      <li *ngFor="let comment of comments">
        {{ comment.content }} - {{ comment.createdAt | date:'short' }}
      </li>
    </ul>
  </div>

  <button [disabled]="!commentForm.valid" type="submit">
    Add Comment
  </button>
</form>
<hr>

  `,
  styles: `textarea { width: 100%; height: 100px; }`
})
export class CommentFormComponent {
  @Input() offerId?: string;
  @Input() responseId?: string;
  commentForm: FormGroup;
  comments$: Observable<Comment[]>;

  constructor(
    private fb: FormBuilder,
    private commentsService: CommentsService,
    private destroyRef: DestroyRef,
  ) {
    this.commentForm = this.fb.group({
      id: uuidv4(),
      content: ['', Validators.required],
      createdAt: [new Date()]
    });

    this.comments$ = this.offerId ?  commentsService.getCommentsByOffer(this.offerId) : commentsService.getCommentsByOffer(this.responseId!) 
  }

  onSubmit() {
    this.commentsService.addComment(this.commentForm.value.content);
    this.commentForm.reset({ id: uuidv4(), content: '', createdAt: new Date() }); //???
  }

}
