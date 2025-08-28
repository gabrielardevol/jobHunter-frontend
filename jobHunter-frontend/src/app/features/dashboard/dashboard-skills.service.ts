import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { OffersService } from '../../services/offers.service';
import { ResponsesService } from '../../services/responses.service';
import { Offer, Response } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardSkillsService {

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

  /** skillCountPerPosition$ */
  get skillCountPerPosition$(): Observable<{ frontend: number; backend: number; fullstack: number; others: number }> {
    return this.offers$.pipe(
      map(offers => {
        const counts = { frontend: 0, backend: 0, fullstack: 0, others: 0 };
        offers.forEach(o => {
          const skillsCount = o.skills?.length || 0;
          switch (o.role) {
            case 'frontend': counts.frontend += skillsCount; break;
            case 'backend': counts.backend += skillsCount; break;
            case 'fullstack': counts.fullstack += skillsCount; break;
            default: counts.others += skillsCount;
          }
        });
        return counts;
      })
    );
  }

  /** avgSalaryPerSkill$ */
  get avgSalaryPerSkill$(): Observable<{ skill: string; avgSalary: number }[]> {
    return combineLatest([this.offers$, this.responses$]).pipe(
      map(([offers, responses]) => {
        const skillMap: Record<string, { totalSalary: number; count: number }> = {};
        offers.forEach(o => {
          let salary = 0;
          if (o.salaryMinimum && o.salaryMaximum) salary = (o.salaryMinimum + o.salaryMaximum) / 2;
          else if (o.salaryMinimum) salary = o.salaryMinimum;
          else if (o.salaryMaximum) salary = o.salaryMaximum;
          if (!salary || !o.skills) return;
          o.skills.forEach(skill => {
            if (!skillMap[skill]) skillMap[skill] = { totalSalary: 0, count: 0 };
            skillMap[skill].totalSalary += salary;
            skillMap[skill].count++;
          });
        });
        return Object.entries(skillMap).map(([skill, data]) => ({
          skill,
          avgSalary: data.totalSalary / data.count
        }));
      })
    );
  }

  /** skillFrequency$ */
  get skillFrequency$(): Observable<{ skill: string; count: number }[]> {
    return this.offers$.pipe(
      map(offers => {
        const freqMap: Record<string, number> = {};
        offers.forEach(o => o.skills?.forEach(skill => {
          freqMap[skill] = (freqMap[skill] || 0) + 1;
        }));
        return Object.entries(freqMap).map(([skill, count]) => ({ skill, count }));
      })
    );
  }

  /** topSkillsBySalary$ */
  get topSkillsBySalary$(): Observable<{ skill: string; avgSalary: number }[]> {
    return this.avgSalaryPerSkill$.pipe(
      map(skills => skills.sort((a, b) => b.avgSalary - a.avgSalary).slice(0, 10))
    );
  }

  /** topSkillsByFrequency$ */
  get topSkillsByFrequency$(): Observable<{ skill: string; count: number }[]> {
    return this.skillFrequency$.pipe(
      map(skills => skills.sort((a, b) => b.count - a.count).slice(0, 10))
    );
  }

}
