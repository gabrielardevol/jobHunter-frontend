import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from '../models/models';
import { SnackbarService } from './snackbars.service';
import { CommentsRepository } from './comments.repository';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  comments$: Observable<Comment[]> = this.commentsSubject.asObservable();

  constructor(
    private snackbarService: SnackbarService,
    private commentsRepo: CommentsRepository
  ) {
    this.init();
  }

  private async init() {
    await this.commentsRepo.init();
    await this.refreshComments();
  }

  private async refreshComments() {
    const allComments = await this.commentsRepo.getAll();
    this.commentsSubject.next(allComments);
  }

  async addComment(content: string) {
    const newComment: Comment = {
      id: uuidv4(),
      createdAt: new Date(),
      content
    };

    await this.commentsRepo.save(newComment);
    await this.refreshComments();

    this.snackbarService.addSnackbar({
      message: 'Comment has been added',
    });
  }

  async updateComment(id: string, updatedComment: Comment) {
    updatedComment.id = updatedComment.id ?? id;
    await this.commentsRepo.save(updatedComment);
    await this.refreshComments();

    this.snackbarService.addSnackbar({
      message: 'Comment has been updated',
    });
  }

  async deleteComment(id: string) {
    await this.commentsRepo.delete(id);
    await this.refreshComments();

    this.snackbarService.addSnackbar({
      message: 'Comment has been deleted',
    });
  }

  getComment(commentId: string): Observable<Comment | undefined> {
    return this.comments$.pipe(
      map(comments => comments.find(c => c.id === commentId))
    );
  }
getCommentsByResponse(responseId: string): Observable<Comment[]> {
  return this.comments$.pipe(
    map(comments => 
      comments
        .filter(c => c.responseId === responseId)
        .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))
    )
  );
}

getCommentsByOffer(offerId: string): Observable<Comment[]> {
  return this.comments$.pipe(
    map(comments => 
      comments
        .filter(c => c.offerId === offerId)
        .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))
    )
  );
}



}
