import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // If running on server (SSR), allow navigation to proceed so client can take over
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (auth.isAuthenticated()) {
    const user = auth.getUser();
    if (user?.role === 'ADMIN') {
      return true;
    }
  }
  
  // Not admin or not logged in, redirect to login
  return router.createUrlTree(['/login']);
};
