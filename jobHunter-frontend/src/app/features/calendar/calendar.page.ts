import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { OffersService } from '../../services/offers.service';
import { ResponsesService } from '../../services/responses.service';
import { Offer, Response } from '../../models/models';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  template: `
    <div class="calendar-header" *ngIf="currentDate$ | async as current">
      <button (click)="prevMonth()">&lt;</button>
      <span>{{ monthNames[current.month] }} {{ current.year }}</span>
      <button (click)="nextMonth()">&gt;</button>
    </div>

    <div class="calendar-grid" *ngIf="currentDate$ | async as current">
      <div class="calendar-day" *ngFor="let day of weekDays">{{ day }}</div>
      <div class="calendar-cell blank" *ngFor="let blank of blanks(current.month, current.year)"></div>

      <div
        class="calendar-cell"
        *ngFor="let day of daysInMonth(current.month, current.year)"
        [class.today]="isToday(day, current.month, current.year)">
        
        <div class="day-number">{{ day }}</div>

        <div class="counts" *ngIf="offerAndResponseCounts$ | async as offerAndResponseCounts">
          <ng-container *ngIf="offerAndResponseCounts[key(current.year, current.month, day)] as data">
            <div class="offers" *ngIf="data.offers.length > 0">
              🟦 {{ data.offers.length }} offers
            </div>
            <div class="responses" *ngIf="data.responses.length > 0">
              🟥 {{ data.responses.length }} responses
            </div>
          </ng-container>
        </div>

        <div *ngIf="interviewsAndAssignments$ | async as iaList">
          <div *ngFor="let r of iaList">
            <ng-container *ngIf="isSameDate(r.date, day, current.month, current.year)">
              <span (click)="offersService.openDetails(r.offer.id)" [ngClass]="r.type">
                {{r.type}} at {{ r.offer.company }}
              </span>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      height: 100%;
      display: flex!important;
      flex-flow: column;
    }
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .calendar-grid {
      flex: 1;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
    }
    .calendar-day {
      text-align: center;
      font-weight: bold;
    }
    .calendar-cell {
      min-height: 60px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 2px;
      font-size: 12px;
    }
    .calendar-cell.today {
      background-color: #2196f3;
      color: white;
    }
    .day-number {
      font-weight: bold;
      margin-bottom: 4px;
    }
    .offers { color: blue; }
    .responses { color: red; }
    .assignment { color: orange; cursor: pointer; }
    .interview { color: green; cursor: pointer; }
  `]
})
export class CalendarPage {

  currentDate$ = new BehaviorSubject<{month: number, year: number}>({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  offerAndResponseCounts$: Observable<Record<string, { offers: Offer[]; responses: Response[] }>>;
  interviewsAndAssignments$: Observable<any[]>;

  constructor(
    public offersService: OffersService,
    private responsesService: ResponsesService,
  ) {
    this.offerAndResponseCounts$ = combineLatest([
      this.offersService.offers$,
      this.responsesService.responses$,
      this.currentDate$
    ]).pipe(
      map(([offers, responses, { month, year }]) =>
        this.buildCalendarData(offers, responses, month, year)
      )
    );

    this.interviewsAndAssignments$ = combineLatest([
      this.responsesService.getAllResponses(),
      this.offersService.offers$
    ]).pipe(
      map(([responses, offers]) =>
        responses
          .filter(response => response.type === 'assignment' || response.type === 'interview')
          .map(response => ({
            ...response,
            offer: offers.find(offer => offer.id === response.offerId)
          }))
      )
    );
  }

  daysInMonth(month: number, year: number): number[] {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  }

  blanks(month: number, year: number): any[] {
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    return Array(firstDay);
  }

  prevMonth() {
    let { month, year } = this.currentDate$.value;
    if (month === 0) {
      month = 11;
      year--;
    } else {
      month--;
    }
    this.currentDate$.next({ month, year });
  }

  nextMonth() {
    let { month, year } = this.currentDate$.value;
    if (month === 11) {
      month = 0;
      year++;
    } else {
      month++;
    }
    this.currentDate$.next({ month, year });
  }

  isToday(day: number, month: number, year: number): boolean {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === month &&
           today.getFullYear() === year;
  }

  buildCalendarData(offers: Offer[], responses: Response[], month: number, year: number) {
    const result: Record<string, { offers: Offer[]; responses: Response[] }> = {};
    const keyFn = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const lastDay = new Date(year, month + 1, 0).getDate();
    Array.from({ length: lastDay }, (_, i) => i + 1).forEach(day => {
      const dummyDate = new Date(year, month, day);
      result[keyFn(dummyDate)] = { offers: [], responses: [] };
    });

    offers.forEach(offer => {
      const date = new Date(offer.createdAt);
      if (date.getMonth() === month && date.getFullYear() === year) {
        result[keyFn(date)].offers.push(offer);
      }
    });

    responses.forEach(response => {
      const date = new Date(response.createdAt);
      if (date.getMonth() === month && date.getFullYear() === year) {
        result[keyFn(date)].responses.push(response);
      }
    });

    return result;
  }

  key(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  isSameDate(date: Date | string | undefined, day: number, month: number, year: number): boolean {
    if (!date) return false;
    const d = date instanceof Date ? date : new Date(date);
    return d.getDate() === day &&
           d.getMonth() === month &&
           d.getFullYear() === year;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') this.prevMonth();
    if (event.key === 'ArrowRight') this.nextMonth();
  }

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
}
