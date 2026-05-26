import {inject, Injectable} from '@angular/core';
import {AuthTokens, AuthUseCase} from '../input/AuthUseCase';
import {UserRepository} from '../output/UserRepository';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements AuthUseCase {
  private readonly userRepository = inject(UserRepository);
  private readonly router = inject(Router);

  async login(email: string, password: string): Promise<string | null> {
    const tokens = await this.userRepository.authenticate(email, password);
    return tokens ? tokens.token : null;
  }

  async loginWithRefreshToken(email: string, password: string): Promise<AuthTokens | null> {
    return await this.userRepository.authenticate(email, password);
  }

  async logout(refreshToken: string): Promise<string | null> {

    try {
      return await this.userRepository.logout(refreshToken);
    } catch (error) {
      console.error('No se pudo invalidar el token en el servidor:', error);
      return null;
    } finally {
      // 2. Limpieza implacable de las credenciales locales (Siempre se ejecuta)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // 3. Sacamos al usuario de las páginas protegidas enviándolo al Login
      void this.router.navigate(['/login']);
    }
  }
}
