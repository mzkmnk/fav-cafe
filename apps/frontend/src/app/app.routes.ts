import { Routes } from '@angular/router';
import { MapViewComponent } from './pages/map-view/map-view';
import { CafeListComponent } from './pages/cafe-list/cafe-list';
import { CafeDetailComponent } from './pages/cafe-detail/cafe-detail';
import { CafeFormComponent } from './pages/cafe-form/cafe-form';

export const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'map', component: MapViewComponent },
  { path: 'list', component: CafeListComponent },
  { path: 'cafe/:id', component: CafeDetailComponent },
  { path: 'cafe/:id/edit', component: CafeFormComponent },
  { path: 'add-cafe', component: CafeFormComponent },
  { path: '**', redirectTo: '/map' }
];
