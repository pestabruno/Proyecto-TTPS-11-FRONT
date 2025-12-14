/*import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // Solo ejecutar en el navegador, no en el servidor
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('jwt_token');
    console.log('JWT Token from localStorage:', token);
    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next(clonedRequest);
    }
  }
 
  return next(req);
}*/