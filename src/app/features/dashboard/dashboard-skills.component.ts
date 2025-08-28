import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSkillsService } from '../../core/services/dashboard-skills.service';
import { AsyncPipe, NgForOf } from '@angular/common';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard-skills',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgForOf, NgApexchartsModule],
  template: `
    <h2>Skills Dashboard</h2>

 <table *ngIf="skillsService.skillsTable$ | async as skills">
  <thead>
    <tr>
      <th>Skill</th>
      <th>Avg Salary</th>
      <th>Frequency</th>
      <th>Frontend</th>
      <th>Backend</th>
      <th>Fullstack</th>
      <th>Others</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let row of skills">
      <td>{{ row.skill }}</td>
      <td>{{ row.avgSalary | number:'1.0-0' }}</td>
      <td>{{ row.frequency }}</td>
      <td>{{ row.frontend }}</td>
      <td>{{ row.backend }}</td>
      <td>{{ row.fullstack }}</td>
      <td>{{ row.others }}</td>
    </tr>
  </tbody>
</table>

<section>
  <h3>Top 10 Skills by Salary</h3>
  <table *ngIf="skillsService.topSkillsBySalary$ | async as topSalary">
    <thead>
      <tr>
        <th>Skill</th>
        <th>Avg Salary</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let skill of topSalary.slice(0, 10)">
        <td>{{ skill.skill }}</td>
        <td>{{ skill.avgSalary | number:'1.0-0' }}</td>
      </tr>
    </tbody>
  </table>
</section>

<section>
  <h3>Top 10 Skills by Frequency</h3>
  <table *ngIf="skillsService.topSkillsByFrequency$ | async as topFreq">
    <thead>
      <tr>
        <th>Skill</th>
        <th>Count</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let skill of topFreq.slice(0, 10)">
        <td>{{ skill.skill }}</td>
        <td>{{ skill.count }}</td>
      </tr>
    </tbody>
  </table>
</section>
    
<apx-chart
  *ngIf="chartOptions$ | async as chartOptions"
  [series]="chartOptions.series!"
  [chart]="{ type: 'pie', width: '100%' }"
  [labels]="chartOptions.labels!"
  [legend]="{position: 'bottom'}"
  [responsive]="chartOptions.responsive!"
/>
`,
  styles: [`
  `]
})
export class DashboardSkillsComponent {
  chartOptions$: Observable<ApexOptions>;

  constructor(public skillsService: DashboardSkillsService) {

    this.chartOptions$ = this.skillsService.skillFrequency$.pipe(
      map(freq => {
        const labels = freq.map(f => f.skill);
        const series = freq.map(f => f.count);

        return {
          series,
          labels,
          responsive: [{
            breakpoint: 480,
            options: {
              chart: { width: 300 },
              legend: { position: 'bottom' }
            }
          }]
        };
      })
    );
  }
}
