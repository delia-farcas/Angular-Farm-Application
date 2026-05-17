import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { provideHttpClient, withInterceptors} from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './services/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    CookieService,
    // Linia combinată și corectă (le șterge pe cele două vechi de HttpClient):
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};
