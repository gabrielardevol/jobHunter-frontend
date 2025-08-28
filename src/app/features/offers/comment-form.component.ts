import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from '../../core/models/models';
import { CommentsService } from '../../core/services/comments.service';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],


  template: `
  <div *ngIf="comments$ | async as comments">
    <ul>
      <li *ngFor="let comment of comments">
        {{ comment.content }} - {{ comment.createdAt | date:'short' }}
      </li>
    </ul>
  </div>
    
  <form [formGroup]="commentForm" (ngSubmit)="onSubmit()"> 
    <input type="text" formControlName="content" placeholder="add a comment">
    <button [disabled]="!commentForm.valid" type="submit">
      send
    </button>
  </form>
  `,


  styles: ``
})

export class CommentFormComponent {
  @Input() offerId!: string;
  @Input() responseId?: string;
  commentForm: FormGroup;
  comments$?: Observable<Comment[]>;

  constructor(
    private fb: FormBuilder,
    private commentsService: CommentsService,
  ) {

    // form
    this.commentForm = this.fb.group({
      content: ['', Validators.required],
      offerId: this.offerId,
    });

   
  }

  ngOnInit(){
    // comment list
    console.log('ngoninit', this.offerId)
    this.comments$ = this.commentsService.getCommentsByOffer(this.offerId)

  }

  onSubmit() {
    this.commentForm.value.offerId = this.offerId
        console.log(this.commentForm.value)

    this.commentsService.addComment(this.commentForm.value);
    this.commentForm.reset();
  }

}
