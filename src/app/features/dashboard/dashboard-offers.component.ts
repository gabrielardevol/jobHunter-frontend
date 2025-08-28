import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardOffersService } from '../../core/services/dashboard-offers.service';
import { AsyncPipe } from '@angular/common';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { map, Observable } from 'rxjs';

export interface ChartDataByDate {
  date: string;         //YYYY-MM-DD'
  offerCount: number;
  responseCount: number;
}

@Component({
  selector: 'app-dashboard-offers',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgApexchartsModule],
  template: `

<div class="dashboard">
  <h1>Offers Dashboard</h1>

  <section class="metrics">
    <h2>Mètriques generals</h2>
    <p>Total offers: {{ dashboardService.totalOffers$ | async }}</p>
    <p>Total responses: {{ dashboardService.totalResponses$ | async }}</p>
    <p>Total responded offers: {{ dashboardService.totalRespondedOffers$ | async }}</p>
    <p>Response ratio: {{ (dashboardService.responseRatio$ | async) | number:'1.0-2' }}%</p>
    <p>Total job offer responses (contracts): {{ dashboardService.totalJobOfferResponses$ | async }}</p>
  </section>

  <section class="by-date" style="min-height: 300px">
    <h2>Offers & Responses by Date</h2>
      <apx-chart *ngIf="offersAndInterviewsByDate$ | async as chartOptions"
      [series]="chartOptions.series!"
      [chart]="{ type: 'bar', height: '100%' }"
      [xaxis]="chartOptions.xaxis!"
      [dataLabels]="{enabled: true}"
      [plotOptions]=" { bar: { horizontal: false, columnWidth: '80%' } }"
      [legend]=" { position: 'bottom' }">
    </apx-chart>  
  </section>

  <section class="positions">
    <h2>Offers by Position</h2>
    <apx-chart
      *ngIf="offersChartOptions$ | async as offersOptions"
      [series]="offersOptions.series!"
      [chart]="{ type: 'pie', height: 350 }"
      [labels]="offersOptions.labels!"
      [legend]="{ position: 'bottom' }"
      >
    </apx-chart>

    <h2>Responses by Position</h2>
    <apx-chart
      *ngIf="responsesChartOptions$ | async as responsesOptions"
      [series]="responsesOptions.series!"
      [chart]="{ type: 'pie', height: 350 }"
      [labels]="responsesOptions.labels!"
      [legend]="{ position: 'bottom' }"
      >
    </apx-chart>
  </section>

  <section class="avg-salary">
    <h2>Average Salary per Reciprocated Offer</h2>
    <apx-chart
    *ngIf="avgSalaryPerReciprocatedSalary$ | async as chartOptions"
    [series]="chartOptions.series!"
    [chart]="{type: 'line', height: '100%'}"
    [stroke]="{curve: 'smooth'}"
    [markers]="{size: 5}"
    [dataLabels]="{enabled: false}"
    [legend]="{position: 'top'}"/>
  </section>

</div>
  `,

  styles: [`
  apx-chart {
  display: block;
  width: 100%;
  height: 100%;
  }
  `]
})
export class DashboardOffersComponent {
  offersAndInterviewsByDate$!: Observable<ApexOptions>;
  avgSalaryPerReciprocatedSalary$!: Observable<ApexOptions>;
  offersChartOptions$!: Observable<ApexOptions>;
  responsesChartOptions$!: Observable<ApexOptions>;

  constructor(public dashboardService: DashboardOffersService) {}

   ngOnInit(): void {
    this.offersAndInterviewsByDate$ = this.dashboardService.offersAndInterviewsByDate$.pipe(
      map((data) => ({
        series: [
          { name: 'Offers', data: data.map(d => d.offerCount) },
          { name: 'Responses', data: data.map(d => d.responseCount) }
        ],
        xaxis: {
          categories: data.map(d =>
            d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date
          )
        },
      }
    )
  ));

  this.avgSalaryPerReciprocatedSalary$ = this.dashboardService.avgSalaryPerReciprocatedSalary$.pipe(
    map((salaryData: any[]) => {
      return {
        series: [
          {
            name: 'Total Offers',
            data: salaryData.map(b => b.totalOffersCount)
          },
          {
            name: 'Reciprocated Offers',
            data: salaryData.map(b => b.reciprocatedOffersCount)
          }
        ],
      };
    })
  );


  this.offersChartOptions$ = this.dashboardService.offersByPosition$.pipe(
    map(data => {
      return {
        series: [
          data.frontend,
          data.backend,
          data.fullstack,
          data.others
        ],
        labels: ['Frontend', 'Backend', 'Fullstack', 'Others'],
      };
    })
  );

  this.responsesChartOptions$ = this.dashboardService.responsesByPosition$.pipe(
    map(data => {
      return {
        series: [
          data.frontend,
          data.backend,
          data.fullstack,
          data.others
        ],
        labels: ['Frontend', 'Backend', 'Fullstack', 'Others'],
      };
    })
  );
  }
}
