import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './services/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withRouterConfig({ canceledNavigationResolution: 'computed' })),
    provideCharts(withDefaultRegisterables()),
    CookieService,
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};
