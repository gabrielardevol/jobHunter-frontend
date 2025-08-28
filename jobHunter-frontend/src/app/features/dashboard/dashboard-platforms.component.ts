import { Component } from '@angular/core';
import { DashboardPlatformsService } from './dashboard-platforms.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-platforms',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="dashboard">
  <h1>Dashboard - Platforms</h1>

  <section class="avg-salary">
    <h2>Average Salary by Platform</h2>
    <div *ngIf="dashboardService.avgSalaryByPlatform$ | async as avgSalary">
      <div *ngFor="let platform of avgSalary | keyvalue">
        {{ platform.key }} → {{ platform.value | number:'1.0-2' }}
      </div>
    </div>
  </section>

  <section class="offer-count">
    <h2>Offer Count by Platform</h2>
    <div *ngIf="dashboardService.offerCountByPlatform$ | async as offerCount">
      <div *ngFor="let platform of offerCount | keyvalue">
        {{ platform.key }} → {{ platform.value }}
      </div>
    </div>
  </section>

  <section class="response-count">
    <h2>Response Count by Platform</h2>
    <div *ngIf="dashboardService.responseCountByPlatform$ | async as responseCount">
      <div *ngFor="let platform of responseCount | keyvalue">
        {{ platform.key }} → {{ platform.value }}
      </div>
    </div>
  </section>

  <section class="contract-types">
    <h2>Contract Type Frequency by Platform</h2>
    <div *ngIf="dashboardService.contractTypeFrequencyByPlatform$ | async as contractTypes">
      <div *ngFor="let platform of contractTypes | keyvalue">
        <strong>{{ platform.key }}</strong>
        <div *ngFor="let type of platform.value | keyvalue">
          {{ type.key }} → {{ type.value }}
        </div>
      </div>
    </div>
  </section>

  <section class="position-frequency">
    <h2>Position Frequency by Platform</h2>
    <div *ngIf="dashboardService.positionFrequencyByPlatform$ | async as posFreq">
      <div *ngFor="let platform of posFreq | keyvalue">
        <strong>{{ platform.key }}</strong>
        <div *ngFor="let role of platform.value | keyvalue">
          {{ role.key }} → {{ role.value }}
        </div>
      </div>
    </div>
  </section>

  <section class="most-platforms">
    <p>Platform with most responses: {{ dashboardService.mostResponsesPlatform$ | async }}</p>
    <p>Platform with most responded offers: {{ dashboardService.mostRespondedOffersPlatform$ | async }}</p>
  </section>
</div>
  `,
  styles: [`
    .dashboard { padding: 20px; font-family: Arial, sans-serif; }
    h1 { margin-bottom: 20px; }
    section { margin-bottom: 20px; }
    strong { display: block; margin-top: 10px; }
    div { margin-left: 10px; }
  `]
})
export class DashboardPlatformsComponent {
  constructor(public dashboardService: DashboardPlatformsService) {}
}
