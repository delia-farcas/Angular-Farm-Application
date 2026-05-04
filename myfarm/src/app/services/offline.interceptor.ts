import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OfflineSyncService } from './offline-sync.service';

/** Intercepts HTTP requests to provide offline support. */
export const offlineInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const offlineService = inject(OfflineSyncService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 0 &&
        (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')
      ) {
        console.warn('Network error detected. Saving request to offline queue.', req.url);
        offlineService.addToQueue(req);
        return of(new HttpResponse({ status: 200, body: { offline: true } }));
      }
      return throwError(() => error);
    }),
  );
};
