import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';

import { OffersService } from './offers.service';
import { ResponsesService } from './responses.service';
import { Response, Offer } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardOffersService {

  private get offers$(): Observable<Offer[]> {
    return this.offersService.offers$;
  }

  private get responses$(): Observable<Response[]> {
    return this.responsesService.responses$;
  }

  constructor(
    private offersService: OffersService,
    private responsesService: ResponsesService
  ) {}

  get totalOffers$(): Observable<number> {
    return this.offers$.pipe(
      map(offers => offers.length)
    );
  }

  get totalResponses$(): Observable<number> {
    return this.responses$.pipe(
      map(responses => responses.length)
    );
  }

  get totalRespondedOffers$(): Observable<number> {
    return combineLatest([this.offers$, this.responses$]).pipe(
      map(([offers, responses]) => {
        const validResponses = responses.filter(r => r.type !== 'rejection');
        const respondedOfferIds = new Set(validResponses.map(r => r.offerId));
        return offers.filter(o => respondedOfferIds.has(o.id)).length;
      })
    );
  }

  get responseRatio$(): Observable<number> {
    return combineLatest([this.offers$, this.responses$]).pipe(
      map(([offers, responses]) => {
        if (offers.length === 0) return 0;
        const validResponses = responses.filter(r => r.type !== 'rejection');
        const respondedOfferIds = new Set(validResponses.map(r => r.offerId));
        const responded = offers.filter(o => respondedOfferIds.has(o.id)).length;
        return (responded / offers.length) * 100;
      })
    );
  }

  get totalJobOfferResponses$(): Observable<number> {
    return this.responses$.pipe(
      map(responses => responses.filter(r => r.type === 'contract').length)
    );
  }

  get offersAndInterviewsByDate$(): Observable<{ date: Date; offerCount: number; responseCount: number }[]> {
    return combineLatest([this.offers$, this.responses$]).pipe(
      map(([offers, responses]) => {
        if (offers.length === 0 && responses.length === 0) return [];

        const allDates = [
          ...offers.map(o => new Date(o.createdAt)),
          ...responses.map(r => new Date(r.createdAt))
        ];
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
        minDate.setHours(0, 0, 0, 0);

        const result: { date: Date; offerCount: number; responseCount: number }[] = [];
        const dayMs = 1000 * 60 * 60 * 24;

        for (let t = minDate.getTime(); t <= maxDate.getTime(); t += dayMs) {
          const d = new Date(t);
          const offersThatDay = offers.filter(o => this.isSameDate(o.createdAt, d)).length;
          const responsesThatDay = responses.filter(r => this.isSameDate(r.createdAt, d)).length;
          result.push({ date: d, offerCount: offersThatDay, responseCount: responsesThatDay });
        }
        return result;
      })
    );
  }

 get avgSalaryPerReciprocatedSalary$(): Observable<{ salaryRange: string; totalOffersCount: number; reciprocatedOffersCount: number }[]> {
    let salaryRanges: number[] = [10000, 12000, 14000, 16000, 18000, 20000, 22000, 24000, 26000, 28000, 30000, 32000, 340000, 36000, 38000, 40000, 42000, 44000, 46000]
    return combineLatest([this.offers$, this.responses$]).pipe(
      map(([offers, responses]) => {
        const buckets = salaryRanges.map((range, i) => {
          const next = salaryRanges[i + 1] || Infinity;
          return {
            salaryRange: `${range} - ${next === Infinity ? '+' : next}`,
            totalOffersCount: 0,
            reciprocatedOffersCount: 0
          };
        });

        offers.forEach(offer => {
          let salary = 0;
          if (offer.salaryMinimum && offer.salaryMaximum) {
            salary = (offer.salaryMinimum + offer.salaryMaximum) / 2;
          } else if (offer.salaryMinimum) {
            salary = offer.salaryMinimum;
          } else if (offer.salaryMaximum) {
            salary = offer.salaryMaximum;
          }
          if (salary === 0) return;

          const bucket = buckets.find(b => {
            const [low, highStr] = b.salaryRange.split(' - ');
            const lowN = parseInt(low, 10);
            const highN = highStr === '+' ? Infinity : parseInt(highStr, 10);
            return salary >= lowN && salary < highN;
          });

          if (bucket) {
            bucket.totalOffersCount++;
            const hasReciprocatedResponse = responses.some(
              r => r.offerId === offer.id && ['interview', 'assignment', 'contract'].includes(r.type)
            );
            if (hasReciprocatedResponse) bucket.reciprocatedOffersCount++;
          }
        });

        return buckets;
      })
    );
  }

  get offersByPosition$(): Observable<{ frontend: number; backend: number; fullstack: number; others: number }> {
    return this.offers$.pipe(
      map(offers => {
        const result = { frontend: 0, backend: 0, fullstack: 0, others: 0 };
        offers.forEach(o => {
          switch (o.role) {
            case 'frontend': result.frontend++; break;
            case 'backend': result.backend++; break;
            case 'fullstack': result.fullstack++; break;
            default: result.others++;
          }
        });
        return result;
      })
    );
  }

  get responsesByPosition$(): Observable<{ frontend: number; backend: number; fullstack: number; others: number }> {
    return combineLatest([this.offers$, this.responses$]).pipe(
      map(([offers, responses]) => {
        const roleMap = new Map(offers.map(o => [o.id, o.role]));
        const result = { frontend: 0, backend: 0, fullstack: 0, others: 0 };
        responses.forEach(r => {
          const role = roleMap.get(r.offerId);
          switch (role) {
            case 'frontend': result.frontend++; break;
            case 'backend': result.backend++; break;
            case 'fullstack': result.fullstack++; break;
            default: result.others++;
          }
        });
        return result;
      })
    );
  }

  /** helper */
  private isSameDate(a: Date | string, b: Date): boolean {
    const da = a instanceof Date ? a : new Date(a);
    return da.getDate() === b.getDate() &&
           da.getMonth() === b.getMonth() &&
           da.getFullYear() === b.getFullYear();
  }
}
