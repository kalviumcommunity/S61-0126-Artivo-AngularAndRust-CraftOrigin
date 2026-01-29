import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if we are in a browser environment before accessing localStorage
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('authToken');

    // Check if the request is for our API
    const isApiUrl = req.url.includes('/api/');

    if (token && isApiUrl) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next(cloned);
    }
  }

  return next(req);
};
