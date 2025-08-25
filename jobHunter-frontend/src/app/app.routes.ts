import { Routes } from '@angular/router';
import { OffersPage } from './offers.page';
import { DashboardPage } from './dashboard/dashboard.page';
import { CalendarPage } from './calendar/calendar.page';

export const routes: Routes = [
    {path: 'offers', component: OffersPage},
    {path: 'dashboard', component: DashboardPage},
    {path: 'calendar', component: CalendarPage}

];
