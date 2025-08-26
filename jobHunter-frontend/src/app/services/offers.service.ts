import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Offer } from '../models/models';
import { SnackbarService } from './snack.service';
import { OffersRepository } from './offers.repository';

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  private offersSubject = new BehaviorSubject<Offer[]>([]);
  offers$: Observable<Offer[]> = this.offersSubject.asObservable();

  constructor(
    private snackbarService: SnackbarService,
    private offersRepo: OffersRepository
  ) {
    this.init();
  }

  private async init() { //async loading db
    await this.offersRepo.init();
    await this.refreshOffers();
  }

  private async refreshOffers() {
    console.log("refreshOffers")
    const allOffers = await this.offersRepo.getAll();
    this.offersSubject.next(allOffers.filter(o => !o.deletedAt));
  }

  async addOffer(offer: Offer) {
    offer.id = uuidv4();
    offer.createdAt = new Date();
    offer.status = 'waiting';

    await this.offersRepo.save(offer);
    await this.refreshOffers();

    this.snackbarService.addSnackbar({
      message: 'Offer has been created',
    });
  }

  async updateOffer(id: string, updatedOffer: Offer) {
    updatedOffer.id = updatedOffer.id ?? id;
    await this.offersRepo.save(updatedOffer);
    await this.refreshOffers();

    this.snackbarService.addSnackbar({
      message: 'Offer has been updated',
    });
  }

  async deleteOffer(id: string) {
    const offer = await this.offersRepo.getById(id);
    if (!offer) return;

    offer.deletedAt = new Date();
    await this.offersRepo.save(offer);
    await this.refreshOffers();

    this.snackbarService.addSnackbar({
      message: 'Offer has been deleted',
      action: () => this.restoreOffer(id)
    });
  }

  async restoreOffer(id: string) {
    const offer = await this.offersRepo.getById(id);
    if (!offer) return;

    offer.deletedAt = undefined;
    await this.offersRepo.save(offer);
    await this.refreshOffers();

    this.snackbarService.addSnackbar({
      message: 'Offer has been restored',
    });
  }

  getOffer(offerId: string): Observable<Offer | undefined> {
    return this.offers$.pipe(
      map(offers => offers.find(o => o.id === offerId))
    );
  }
}
