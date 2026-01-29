import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Check if we are running in the browser
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      console.log('AuthGuard: Token found, allowing navigation.');
      return true;
    }
    console.log('AuthGuard: No token found, redirecting to login.');
    // If not authenticated in browser, redirect to login page
    return router.createUrlTree(['/login']);
  }

  // SSR context: Allow rendering so client can take over and check localStorage
  console.log('AuthGuard: SSR context, allowing navigation.');
  return true;
};
