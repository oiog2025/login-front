import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, filter, switchMap, take} from 'rxjs/operators';
import {CryptoStorageService} from '../services/CryptoStorageService';

// Variables globales
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cryptoStorage = inject(CryptoStorageService);
  const token = cryptoStorage.getItem('access_token');
  const http = inject(HttpClient);
  const router = inject(Router);


  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {Authorization: `Bearer ${token}`}
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/login') &&
        !req.url.includes('/refresh-token')
      ) {
        return handle401Error(authReq, next, http, router, cryptoStorage);
      }
      return throwError(() => error);
    })
  );
};

// TIPADOS ESTRICTOS AÑADIDOS AQUÍ PARA EVITAR EL ERROR TS2322
const handle401Error = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  http: HttpClient,
  router: Router,
  cryptoStorage: CryptoStorageService,
): Observable<HttpEvent<unknown>> => {

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = cryptoStorage.getItem('refresh_token');

    if (refreshToken) {
      return http.post<any>('http://localhost:8080/api/auth/refresh-token', {refreshToken}).pipe(
        switchMap((response: any) => {
          isRefreshing = false;

          const newToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          localStorage.setItem('access_token', newToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          refreshTokenSubject.next(newToken);

          return next(req.clone({
            setHeaders: {Authorization: `Bearer ${newToken}`}
          }));
        }),
        catchError((err) => {
          isRefreshing = false;
          localStorage.clear();
          void router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      localStorage.clear();
      void router.navigate(['/login']);
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        return next(req.clone({
          setHeaders: {Authorization: `Bearer ${token as string}`} // Cast a string por seguridad
        }));
      })
    );
  }
};
