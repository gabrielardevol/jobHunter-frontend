import { Component } from '@angular/core';
import { DashboardOffersService } from './dashboard-offers.service';
import { CommonModule } from '@angular/common';
import { DashboardOffersComponent } from "./dashboard-offers.component";
import { DashboardSkillsComponent } from "./dashboard-skills.component";
import { DashboardPlatformsComponent } from "./dashboard-platforms.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardOffersComponent, DashboardSkillsComponent, DashboardPlatformsComponent],
  template: `

<header>header</header>
  <nav style="position: sticky; top: 0">
    <button (click)="tab = 'offers'">offers</button>
    <button (click)="tab = 'skills'">skills</button>
    <button (click)="tab = 'platforms'">platforms</button>
  </nav>
  
  <app-dashboard-offers *ngIf="tab === 'offers'"/>
  <app-dashboard-skills *ngIf="tab === 'skills'"/>
  <app-dashboard-platforms *ngIf="tab === 'platforms'"/>

  `,
  styles: ``
})
export class DashboardPage {

  tab: 'offers' | 'skills' | 'platforms' = 'offers'

  constructor(
    public dashboardService: DashboardOffersService
  ){
  }

}
