import { Routes } from '@angular/router';
import { StartingPage } from './starting-page/starting-page';
import { AppPage } from './app-page/app-page';
import { BazingaPage } from './bazinga-page/bazinga-page';
import { RaportsPage } from './raports-page/raports-page';

export const routes: Routes = [
  { 
    path: '', 
    component: StartingPage
  },
  {
    path: 'home', 
    component: AppPage
  },
  {
    path: 'bazinga',
    component: BazingaPage
  },
  {
    path: 'raports',
    component: RaportsPage
  }
];