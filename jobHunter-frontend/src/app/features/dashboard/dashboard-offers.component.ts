import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardOffersService } from './dashboard-offers.service';
import { AsyncPipe, NgForOf } from '@angular/common';

@Component({
  selector: 'app-dashboard-offers',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgForOf],
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

      <section class="by-date">
        <h2>Offers & Responses by Date</h2>
        <div *ngIf="dashboardService.offersAndInterviewsByDate$ | async as data">
          <div *ngFor="let d of data">
            {{ d.date | date:'yyyy-MM-dd' }} → 
            Offers: {{ d.offerCount }}, 
            Responses: {{ d.responseCount }}
          </div>
        </div>
      </section>

      <section class="positions">
        <h2>Offers by Position</h2>
        <div *ngIf="dashboardService.offersByPosition$ | async as offersPos">
          Frontend: {{ offersPos.frontend }} <br>
          Backend: {{ offersPos.backend }} <br>
          Fullstack: {{ offersPos.fullstack }} <br>
          Others: {{ offersPos.others }}
        </div>

        <h2>Responses by Position</h2>
        <div *ngIf="dashboardService.responsesByPosition$ | async as responsesPos">
          Frontend: {{ responsesPos.frontend }} <br>
          Backend: {{ responsesPos.backend }} <br>
          Fullstack: {{ responsesPos.fullstack }} <br>
          Others: {{ responsesPos.others }}
        </div>
      </section>

      <section class="avg-salary">
        <h2>Average Salary per Reciprocated Offer</h2>
        <div *ngIf="dashboardService.avgSalaryPerReciprocatedSalary$ | async as salaryData">
          <table>
            <thead>
              <tr>
                <th>Salary Range</th>
                <th>Total Offers</th>
                <th>Reciprocated Offers</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let bucket of salaryData">
                <td>{{ bucket.salaryRange }}</td>
                <td>{{ bucket.totalOffersCount }}</td>
                <td>{{ bucket.reciprocatedOffersCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard { padding: 1rem; font-family: Arial, sans-serif; }
    h1 { margin-bottom: 1rem; }
    section { margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
    th { background-color: #f0f0f0; }
  `]
})
export class DashboardOffersComponent {
  constructor(public dashboardService: DashboardOffersService) {}
}
