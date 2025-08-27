import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  template: `
    <div class="calendar-header">
      <button (click)="prevMonth()">&lt;</button>
      <span>{{ monthNames[currentMonth] }} {{ currentYear }}</span>
      <button (click)="nextMonth()">&gt;</button>
    </div>

    <div class="calendar-grid">
      <div class="calendar-day" *ngFor="let day of weekDays">{{ day }}</div>
      <div class="calendar-cell" *ngFor="let blank of blanks"></div>
      <div 
        class="calendar-cell" 
        *ngFor="let day of daysInMonth"
        [class.today]="isToday(day)">
        {{ day }}
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
      text-align: center;
      line-height: 40px;
      border-radius: 4px;
    }
    .calendar-cell.today {
      background-color: #2196f3;
      color: white;
    }
  `]
})
export class CalendarPage {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  get daysInMonth(): number[] {
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  }

  get blanks(): any[] {
    let firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay(); 
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    return Array(firstDay);
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  isToday(day: number): boolean {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === this.currentMonth &&
           today.getFullYear() === this.currentYear;
  }
}

