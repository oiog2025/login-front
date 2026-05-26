import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {CryptoStorageService} from './services/CryptoStorageService';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const cryptoStorage = inject(CryptoStorageService);

  // 🛡️ REGLA DE SEGURIDAD: Verificamos si existe el access_token en el navegador
  const token = cryptoStorage.getItem('access_token');

  if (token) {
    return true; // Permitir el paso a la ruta
  }

  // Si no hay token, lo redirigimos al Login y bloqueamos el acceso
  void router.navigate(['/login']);
  return false;
};
