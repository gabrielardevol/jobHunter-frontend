import { Routes } from '@angular/router';
import { OffersPage } from './features/offers/offers.page';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { CalendarPage } from './features/calendar/calendar.page';
import { ResponsesPage } from './features/offers/responses.page';

export const routes: Routes = [
    {path: 'offers', component: OffersPage},
    {path: 'responses', component: ResponsesPage},
    {path: 'dashboard', component: DashboardPage},
    {path: 'calendar', component: CalendarPage}
];
