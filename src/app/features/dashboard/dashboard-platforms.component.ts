import { Component } from '@angular/core';
import { DashboardPlatformsService } from '../../core/services/dashboard-platforms.service';
import { CommonModule } from '@angular/common';
import { ApexAxisChartSeries, ApexOptions, ApexXAxis, NgApexchartsModule } from 'ng-apexcharts';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard-platforms',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
<div class="dashboard">
  <h1>Dashboard - Platforms</h1>

  <div *ngIf="salaryPerPlatforms$ | async as chartOptions">
    <h2>Salary per platform</h2>
    <apx-chart
      [series]="chartOptions.series!"
      [chart]=" { type: 'line', height: 400 }"
      [xaxis]="chartOptions.xaxis!"
      [dataLabels]="{enabled: true}"
      [legend]="{position: 'top'}">
    </apx-chart>
  </div>

  <div *ngIf="boxplotOptions$ | async as chartOptions">
    <h2>Salary distribution per platform</h2>
    <apx-chart
      [series]="chartOptions.series!"
      [chart]="{type: 'boxPlot'}"
      [xaxis]="chartOptions.xaxis!">
    </apx-chart>
  </div>
  <div *ngIf="positionFrequencyHeatmap$ | async as chartOptions">
    <h2>Position Frequency by Platform</h2>
    <apx-chart
      [series]="chartOptions.series!"
      [chart]="{type: 'heatmap'}"
      [dataLabels]="{enabled: true}">
    </apx-chart>
  </div>

  <section class="most-platforms">
    <p>Platform with most responses: {{ dashboardService.mostResponsesPlatform$ | async }}</p>
    <p>Platform with most responded offers: {{ dashboardService.mostRespondedOffersPlatform$ | async }}</p>
  </section>

   <section>
      <h3>Offers by Platform</h3>
      <apx-chart *ngIf="offersChartOptions$ | async as chartOptions"
        [series]="chartOptions.series!"
        [chart]="{ type: 'pie', height: 350 }"
        [labels]="chartOptions.labels!"
        [legend]="{position: 'bottom'}">
      </apx-chart>
    </section>

    <section>
      <h3>Responses by Platform</h3>
      <apx-chart *ngIf="responsesChartOptions$ | async as chartOptions"
        [series]="chartOptions.series!"
        [chart]="{ type: 'pie', height: 350 }"
        [labels]="chartOptions.labels!"
        [legend]="{position: 'bottom'}">
      </apx-chart>
    </section>
</div>
  `,
  styles: [`
  `]
})
export class DashboardPlatformsComponent {

  salaryPerPlatforms$: Observable<ApexOptions>;
  boxplotOptions$: Observable<ApexOptions>;
  positionFrequencyHeatmap$: Observable<ApexOptions>
  offersChartOptions$: Observable<ApexOptions>;
  responsesChartOptions$: Observable<ApexOptions>;
  
 constructor(public dashboardService: DashboardPlatformsService) {

  this.positionFrequencyHeatmap$ = dashboardService.positionFrequencyByPlatform$.pipe(
    map(data => {
    const roles = ['frontend', 'backend', 'fullstack', 'others'];
    const series: ApexAxisChartSeries = roles.map(role => ({
      name: role,
      data: Object.entries(data).map(([platform, counts]) => ({
        x: platform,
        y: counts[role] || 0
      }))
    }));

    return {series};
    })
  );

  this.salaryPerPlatforms$ = this.dashboardService.salaryIntervalsByPlatform$.pipe(
    map(data => {
    const allIntervals = Array.from(new Set(data.map(d => d.interval))).sort((a,b) => a-b);
    const platforms = Array.from(new Set(data.map(d => d.platform)));
    const series: ApexAxisChartSeries = platforms.map(platform => ({
      name: platform,
      data: allIntervals.map(interval => {
        const record = data.find(d => d.platform === platform && d.interval === interval);
        return record ? record.offersCount : 0;
    })})
  );

  return {
    series,
    xaxis: { categories: allIntervals, title: { text: 'Salary Interval (€)' } },
    };})
  );

  this.boxplotOptions$ = this.dashboardService.salaryBoxplotByPlatform$.pipe(
    map(platformData => {

    const series: ApexAxisChartSeries = [
      {
        name: 'Salaries',
        type: 'boxPlot',
        data: platformData.map(p => {
          const salaries = p.salaries.sort((a, b) => a - b);
          const min = salaries[0];
          const max = salaries[salaries.length - 1];
          const q1 = salaries[Math.floor(salaries.length * 0.25)] || 0;
          const q2 = salaries[Math.floor(salaries.length * 0.5)] || 0;
          const q3 = salaries[Math.floor(salaries.length * 0.75)] || 0;
          return { x: p.platform, y: [min, q1, q2, q3, max] };
    })}];

    const xaxis: ApexXAxis = {
      type: 'category',
      categories: platformData.map(p => p.platform)
    };

    return {
      series,
      xaxis,
  };})); 

  this.offersChartOptions$ = this.dashboardService.offerCountByPlatform$.pipe(
    map(data => ({
      series: Object.values(data),
      labels: Object.keys(data),
  })));

  this.responsesChartOptions$ = this.dashboardService.responseCountByPlatform$.pipe(
    map(data => ({
      series: Object.values(data),
      labels: Object.keys(data),
  })));
  }
}
