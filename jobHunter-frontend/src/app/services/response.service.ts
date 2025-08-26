import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Response } from '../models/models';
import { SnackbarService } from './snack.service';
import { ResponsesRepository } from './response.repository';

@Injectable({
  providedIn: 'root'
})
export class ResponsesService {
  private responsesSubject = new BehaviorSubject<Response[]>([]);
  responses$: Observable<Response[]> = this.responsesSubject.asObservable();

  constructor(
    private snackbarService: SnackbarService,
    private responsesRepo: ResponsesRepository
  ) {
    this.init();
  }

  private async init() {
    await this.responsesRepo.init();
    await this.refreshResponses();
  }

  private async refreshResponses() {
    const allResponses = await this.responsesRepo.getAll();
    this.responsesSubject.next(allResponses.filter(r => !(r as any).deletedAt));
  }

  async addResponse(response: Response) {
    response.id = uuidv4();
    response.createdAt = new Date();

    await this.responsesRepo.save(response);
    await this.refreshResponses();

    this.snackbarService.addSnackbar({
      message: 'Response has been created',
    });
  }

  async updateResponse(id: string, updatedResponse: Response) {
    updatedResponse.id = updatedResponse.id ?? id;
    await this.responsesRepo.save(updatedResponse);
    await this.refreshResponses();

    this.snackbarService.addSnackbar({
      message: 'Response has been updated',
    });
  }

  async deleteResponse(id: string) {
    const response = await this.responsesRepo.getById(id);
    if (!response) return;

    // si vols soft-delete:
    (response as any).deletedAt = new Date();
    await this.responsesRepo.save(response);
    await this.refreshResponses();

    this.snackbarService.addSnackbar({
      message: 'Response has been deleted',
      action: () => this.restoreResponse(id)
    });
  }

  async restoreResponse(id: string) {
    const response = await this.responsesRepo.getById(id);
    if (!response) return;

    (response as any).deletedAt = undefined;
    await this.responsesRepo.save(response);
    await this.refreshResponses();

    this.snackbarService.addSnackbar({
      message: 'Response has been restored',
    });
  }

  getResponse(responseId: string): Observable<Response | undefined> {
    return this.responses$.pipe(
      map(responses => responses.find(r => r.id === responseId))
    );
  }
}
