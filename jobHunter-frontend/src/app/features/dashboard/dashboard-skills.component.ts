import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSkillsService } from './dashboard-skills.service';
import { AsyncPipe, NgForOf } from '@angular/common';

@Component({
  selector: 'app-dashboard-skills',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgForOf],
  template: `
    <h2>Skills Dashboard</h2>

    <section>
      <h3>Skill Count per Position</h3>
      <div *ngIf="skillsService.skillCountPerPosition$ | async as counts">
        <p>Frontend: {{ counts.frontend }}</p>
        <p>Backend: {{ counts.backend }}</p>
        <p>Fullstack: {{ counts.fullstack }}</p>
        <p>Others: {{ counts.others }}</p>
      </div>
    </section>

    <section>
      <h3>Average Salary per Skill</h3>
      <ul>
        <li *ngFor="let item of skillsService.avgSalaryPerSkill$ | async">
          {{ item.skill }}: {{ item.avgSalary | number:'1.0-0' }}
        </li>
      </ul>
    </section>

    <section>
      <h3>Skill Frequency</h3>
      <ul>
        <li *ngFor="let item of skillsService.skillFrequency$ | async">
          {{ item.skill }}: {{ item.count }}
        </li>
      </ul>
    </section>

    <section>
      <h3>Top Skills by Salary</h3>
      <ul>
        <li *ngFor="let item of skillsService.topSkillsBySalary$ | async">
          {{ item.skill }}: {{ item.avgSalary | number:'1.0-0' }}
        </li>
      </ul>
    </section>

    <section>
      <h3>Top Skills by Frequency</h3>
      <ul>
        <li *ngFor="let item of skillsService.topSkillsByFrequency$ | async">
          {{ item.skill }}: {{ item.count }}
        </li>
      </ul>
    </section>
  `,
  styles: [`
    h2 { font-size: 1.8rem; margin-bottom: 1rem; }
    section { margin-bottom: 2rem; }
    h3 { font-size: 1.4rem; margin-bottom: 0.5rem; }
    ul { padding-left: 1rem; }
    li { margin-bottom: 0.25rem; }
  `]
})
export class DashboardSkillsComponent {
  constructor(public skillsService: DashboardSkillsService) {}
}
