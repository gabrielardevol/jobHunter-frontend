import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, take } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Offer, Response } from '../models/models';
import { SnackbarService } from './snackbars.service';
import { ResponsesRepository } from '../repositories/responses.repository';
import { OffersService } from './offers.service';

@Injectable({
  providedIn: 'root'
})
export class ResponsesService {
  private responsesSubject = new BehaviorSubject<Response[]>([]);
  responses$: Observable<Response[]> = this.responsesSubject.asObservable();

  constructor(
    private snackbarService: SnackbarService,
    private responsesRepo: ResponsesRepository,
    private offerService: OffersService
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
    console.log(response);
    response.id = uuidv4();
    response.createdAt = new Date();

    await this.responsesRepo.save(response);
    await this.refreshResponses();

   this.offerService.getOffer(response.offerId).pipe(
    take(1)
    ).subscribe(offer => {
      if (!offer) return;

      let newStatus: 'waiting' | 'onProcess' | 'contract' | 'rejected' = 'waiting';

      switch (response.type) {
        case 'interview':
        case 'assignment':
          newStatus = 'onProcess';
          break;
        case 'contract':
          newStatus = 'contract';
          break;
        case 'rejection':
          newStatus = 'rejected';
          break;
      }

      const updatedOffer: Offer = { ...offer, status: newStatus };
      this.offerService.updateOffer(updatedOffer.id, updatedOffer);
    });
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

  getResponse(responseId: string): Observable<Response[] | undefined> {
    console.log("getting responses...");
    return this.responses$.pipe(
      map(responses =>
        responses
          .filter(r => r.id === responseId)
          .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))
      )
    );
  }

  getAllResponses(): Observable<Response[]> {
    console.log("getting all responses...");
    return this.responses$.pipe(
      map(responses =>
        [...responses].sort(
          (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
        )
      )
    );
  }


  getResponsesByOffer(offerId: string): Observable<Response[]> {
    console.log("getting responses for offer", offerId);
    return this.responses$.pipe(
      map(responses =>
        responses
          .filter(r => r.offerId === offerId)
          .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))
      )
    );
  }
}
