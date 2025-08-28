import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { OffersService } from './offers.service';
import { ResponsesService } from './responses.service';
import { Response, Offer } from '../models/models';

interface PlatformSalaryInterval  {
  interval: number;               // límit superior de l'interval
  offersCount: number;
  platform: string;
}

interface PlatformSalaryBoxplot {
  platform: string;
  salaries: number[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardPlatformsService {

  constructor(
    private offersService: OffersService,
    private responsesService: ResponsesService
  ) {}

  private get offers$(): Observable<Offer[]> {
    return this.offersService.offers$;
  }

  private get responses$(): Observable<Response[]> {
    return this.responsesService.responses$;
  }

  /** Average salary by position */
  get avgSalaryByPosition$(): Observable<{ frontend: number; backend: number; fullstack: number; others: number }> {
    return this.offers$.pipe(
      map(offers => {
        const result = { frontend: 0, backend: 0, fullstack: 0, others: 0 };
        const counts = { frontend: 0, backend: 0, fullstack: 0, others: 0 };
        offers.forEach(o => {
          let salary = 0;
          if (o.salaryMinimum && o.salaryMaximum) salary = (o.salaryMinimum + o.salaryMaximum) / 2;
          else if (o.salaryMinimum) salary = o.salaryMinimum;
          else if (o.salaryMaximum) salary = o.salaryMaximum;

          switch (o.role) {
            case 'frontend': result.frontend += salary; counts.frontend++; break;
            case 'backend': result.backend += salary; counts.backend++; break;
            case 'fullstack': result.fullstack += salary; counts.fullstack++; break;
            default: result.others += salary; counts.others++;
          }
        });
        return {
          frontend: counts.frontend ? result.frontend / counts.frontend : 0,
          backend: counts.backend ? result.backend / counts.backend : 0,
          fullstack: counts.fullstack ? result.fullstack / counts.fullstack : 0,
          others: counts.others ? result.others / counts.others : 0
        };
      })
    );
  }


/** Position frequency by platform */
get positionFrequencyByPlatform$(): Observable<Record<string, Record<string, number>>> {
  return this.offers$.pipe(
    map(offers => {
      const result: Record<string, Record<string, number>> = {};
      offers.forEach(o => {
        const platform = o.platform || 'unknown'; // fallback
        if (!result[platform]) result[platform] = { frontend: 0, backend: 0, fullstack: 0, others: 0 };
        switch (o.role) {
          case 'frontend': result[platform]['frontend']++; break;
          case 'backend': result[platform]['backend']++; break;
          case 'fullstack': result[platform]['fullstack']++; break;
          default: result[platform]['others']++;
        }
      });
      return result;
    })
  );
}

/** Average salary by platform */
get avgSalaryByPlatform$(): Observable<Record<string, number>> {
  return this.offers$.pipe(
    map(offers => {
      const totals: Record<string, number> = {};
      const counts: Record<string, number> = {};
      offers.forEach(o => {
        const platform = o.platform || 'unknown'; // fallback
        let salary = 0;
        if (o.salaryMinimum && o.salaryMaximum) salary = (o.salaryMinimum + o.salaryMaximum) / 2;
        else if (o.salaryMinimum) salary = o.salaryMinimum;
        else if (o.salaryMaximum) salary = o.salaryMaximum;

        if (!totals[platform]) { totals[platform] = 0; counts[platform] = 0; }
        totals[platform] += salary;
        counts[platform]++;
      });
      const result: Record<string, number> = {};
      Object.keys(totals).forEach(p => result[p] = counts[p] ? totals[p] / counts[p] : 0);
      return result;
    })
  );
}

/** Offer count by platform */
get offerCountByPlatform$(): Observable<Record<string, number>> {
  return this.offers$.pipe(
    map(offers => {
      const result: Record<string, number> = {};
      offers.forEach(o => {
        const platform = o.platform || 'unknown';
        result[platform] = (result[platform] || 0) + 1;
      });
      return result;
    })
  );
}

/** Response count by platform */
get responseCountByPlatform$(): Observable<Record<string, number>> {
  return combineLatest([this.offers$, this.responses$]).pipe(
    map(([offers, responses]) => {
      const result: Record<string, number> = {};
      responses.forEach(r => {
        const offer = offers.find(o => o.id === r.offerId);
        if (!offer) return;
        const platform = offer.platform || 'unknown';
        result[platform] = (result[platform] || 0) + 1;
      });
      return result;
    })
  );
}

/** Platform with most responses */
get mostResponsesPlatform$(): Observable<string> {
  return this.responseCountByPlatform$.pipe(
    map(counts => Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'unknown'))
  );
}

/** Platform with most responded offers */
get mostRespondedOffersPlatform$(): Observable<string> {
  return combineLatest([this.offers$, this.responses$]).pipe(
    map(([offers, responses]) => {
      const respondedOfferIds = new Set(responses.filter(r => r.type !== 'rejection').map(r => r.offerId));
      const platformCounts: Record<string, number> = {};
      offers.forEach(o => {
        const platform = o.platform || 'unknown';
        if (respondedOfferIds.has(o.id)) {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        }
      });
      return Object.keys(platformCounts).reduce((a, b) => platformCounts[a] > platformCounts[b] ? a : b, 'unknown');
    })
  );
}

get salaryIntervalsByPlatform$(): Observable<PlatformSalaryInterval[]> {
  const intervalStep = 2000;
  const maxSalary = 60000;

  return this.offers$.pipe(
    map(offers => {
      const platforms = Array.from(new Set(offers.map(o => o.platform || 'Unknown')));
      const allIntervals = Array.from({length: maxSalary / intervalStep}, (_, i) => (i + 1) * intervalStep);

      const result: PlatformSalaryInterval[] = [];

      // Inicialitzar totes les combinacions platform + interval amb 0
      platforms.forEach(platform => {
        allIntervals.forEach(interval => {
          result.push({ platform, interval, offersCount: 0 }); // <-- canviat de allOffersCount
        });
      });

      // Comptar ofertes
      offers.forEach(offer => {
        const platform = offer.platform || 'Unknown';

        // Calcular salary
        const min = typeof offer.salaryMinimum === 'number' ? offer.salaryMinimum : 0;
        const max = typeof offer.salaryMaximum === 'number' ? offer.salaryMaximum : 0;
        let salary = 0;
        if (min > 0 && max > 0) salary = (min + max) / 2;
        else if (min > 0) salary = min;
        else if (max > 0) salary = max;
        else return; // salary desconegut

        if (salary <= 0 || salary > maxSalary) return;

        // Trobar interval corresponent
        const intervalIndex = Math.ceil(salary / intervalStep) - 1;
        const intervalValue = (intervalIndex + 1) * intervalStep;

        // Buscar l'objecte corresponent al result
        const record = result.find(r => r.platform === platform && r.interval === intervalValue);
        if (record) record.offersCount++; // <-- canviat de allOffersCount
      });

      return result;
    })
  );
}

get salaryBoxplotByPlatform$(): Observable<PlatformSalaryBoxplot[]> {
  return this.offers$.pipe(
    map(offers => {
      const platformMap: Record<string, number[]> = {};

      offers.forEach(offer => {
        const platform = offer.platform || 'Unknown';

        const min = typeof offer.salaryMinimum === 'number' ? offer.salaryMinimum : 0;
        const max = typeof offer.salaryMaximum === 'number' ? offer.salaryMaximum : 0;
        let salary = 0;

        if (min > 0 && max > 0) {
          salary = (min + max) / 2;
        } else if (min > 0) {
          salary = min;
        } else if (max > 0) {
          salary = max;
        } else {
          return; // salary desconegut o zero
        }

        if (!platformMap[platform]) platformMap[platform] = [];
        platformMap[platform].push(salary);
      });

      return Object.entries(platformMap).map(([platform, salaries]) => ({
        platform,
        salaries
      }));
    })
  );
}
}
