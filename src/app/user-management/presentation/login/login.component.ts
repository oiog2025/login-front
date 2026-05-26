import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {AuthInPort} from '../../application/input/AuthInPort';
import {CryptoStorageService} from '../../infrastructure/services/CryptoStorageService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);
  private fb = inject(FormBuilder);
  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  private authUseCase = inject(AuthInPort);
  private router = inject(Router);
  private cryptoStorage = inject(CryptoStorageService);

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const {email, password} = this.loginForm.value;

    try {
      const tokens = await this.authUseCase.loginWithRefreshToken(email, password);

      if (tokens) {
        this.cryptoStorage.setItem('access_token', tokens.token);
        this.cryptoStorage.setItem('refresh_token', tokens.refreshToken);
        this.showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');

        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 600);
      }
    } catch (error) {
      console.error('Error capturado en login:', error);

      if (error instanceof HttpErrorResponse) {
        const backendMessage = error.error?.message || 'Credenciales incorrectas o error de conexión.';
        this.showError(backendMessage);
      } else {
        this.showError('Ocurrió un error inesperado al procesar la solicitud.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private showSuccess(message: string) {
    this.successMessage.set(message);
    this.errorMessage.set(null);
    setTimeout(() => this.successMessage.set(null), 4000);
  }

  private showError(message: string) {
    this.errorMessage.set(message);
    this.successMessage.set(null);
    setTimeout(() => this.errorMessage.set(null), 5000);
  }
}
