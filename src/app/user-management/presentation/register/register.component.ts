import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {UserInPort} from '../../application/input/UserInPort';
import {User} from '../../domain/User';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);
  private fb = inject(FormBuilder);
  public registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    isActive: [true]
  });
  private userUseCase = inject(UserInPort);
  private router = inject(Router);

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {

      // 1. Extraemos los valores del formulario
      const formValues = this.registerForm.value;

      // 2. Construimos el objeto de dominio limpio (usando tipos puros)
      const payloadAlBackend: Partial<User> = {
        name: formValues.name,
        email: formValues.username,
        password: formValues.password,
        isActive: formValues.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 4. Enviamos el objeto completo a nuestro puerto en lugar de this.registerForm.value
      const newUser = await this.userUseCase.createUser(payloadAlBackend);
      console.log(newUser);

      if (newUser) {
        this.showSuccess('¡Usuario creado exitosamente!');
        // Damos 1 segundos para que el usuario pueda ver el Toast verde antes de redirigir
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      // Extraemos el mensaje de error del backend si existe
      this.errorMessage.set(error?.error?.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.');
      this.showError(error?.error?.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    void this.router.navigate(['/login']);
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
