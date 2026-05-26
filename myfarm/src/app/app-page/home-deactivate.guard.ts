import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { UserTrackingService } from '../services/user-tracking.service';

export const logoutConfirmationGuard: CanDeactivateFn<any> = (
  _component,
  _currentRoute,
  _currentState,
  nextState,
) => {
  const trackingService = inject(UserTrackingService);

  const pleacaSpreLogin =
    nextState.url === '/' || nextState.url === '' || nextState.url.includes('login');

  if (pleacaSpreLogin) {
    const confirmare = confirm('Esti sigur/a ca vrei sa te deconectezi?');

    if (confirmare) {
      trackingService.logout();
      return true;
    }
    return false;
  }

  return true;
};
