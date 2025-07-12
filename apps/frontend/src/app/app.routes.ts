import { Routes } from '@angular/router';
import { MapViewComponent } from './pages/map-view/map-view.component';
import { CafeListComponent } from './pages/cafe-list/cafe-list.component';
import { CafeDetailComponent } from './pages/cafe-detail/cafe-detail.component';
import { CafeFormComponent } from './pages/cafe-form/cafe-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'map', component: MapViewComponent },
  { path: 'list', component: CafeListComponent },
  { path: 'cafe/:id', component: CafeDetailComponent },
  { path: 'cafe/:id/edit', component: CafeFormComponent },
  { path: 'add-cafe', component: CafeFormComponent },
  { path: '**', redirectTo: '/map' }
];
