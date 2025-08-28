import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';

import { OffersService } from './offers.service';
import { ResponsesService } from './responses.service';
import { Response, Offer } from '../models/models';

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
          const skills = Array.isArray(o.skills) ? o.skills : [];
          const skillsCount = skills.length;
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
      map(([offers]) => {
        const skillMap: Record<string, { totalSalary: number; count: number }> = {};
        offers.forEach(o => {
          let salary = 0;
          if (o.salaryMinimum && o.salaryMaximum) salary = (o.salaryMinimum + o.salaryMaximum) / 2;
          else if (o.salaryMinimum) salary = o.salaryMinimum;
          else if (o.salaryMaximum) salary = o.salaryMaximum;

          if (!salary) return;

          const skills = Array.isArray(o.skills) ? o.skills : [];
          skills.forEach((skill: string) => {
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
        offers.forEach(o => {
          const skills = Array.isArray(o.skills) ? o.skills : [];
          skills.forEach((skill: string) => {
            freqMap[skill] = (freqMap[skill] || 0) + 1;
          });
        });
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

  get skillsTable$() {
  return combineLatest([
    this.offers$,
    this.avgSalaryPerSkill$,
    this.skillFrequency$
  ]).pipe(
    map(([offers, avgSalary, frequency]) => {
      const skillSet = new Set<string>();
      avgSalary.forEach(s => skillSet.add(s.skill));
      frequency.forEach(f => skillSet.add(f.skill));
      offers.forEach(o => {
        const skills = Array.isArray(o.skills) ? o.skills : [];
        skills.forEach(s => skillSet.add(s));
      });

      return Array.from(skillSet).map(skill => {
        let frontend = 0, backend = 0, fullstack = 0, others = 0;

        offers.forEach(o => {
          const skills = Array.isArray(o.skills) ? o.skills : [];
          if (skills.includes(skill)) {
            switch(o.role) {
              case 'frontend': frontend++; break;
              case 'backend': backend++; break;
              case 'fullstack': fullstack++; break;
              default: others++;
            }
          }
        });

        return {
          skill,
          avgSalary: avgSalary.find(s => s.skill === skill)?.avgSalary ?? 0,
          frequency: frequency.find(f => f.skill === skill)?.count ?? 0,
          frontend,
          backend,
          fullstack,
          others
        };
      });
    })
  );
}


}
