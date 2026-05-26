import {Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {User} from '../../domain/User';
import {UserUseCase} from '../../application/input/UserUseCase';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-edit-modal.component.html',
  styleUrl: './user-edit-modal.component.css'
})
export class UserEditModalComponent implements OnChanges {

  // Recibe el usuario seleccionado desde la tabla
  @Input() user: User | null = null;

  // Eventos para avisarle al componente padre
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);

  private fb = inject(FormBuilder);
  public editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    isActive: [true]
  });
  private userUseCase = inject(UserUseCase);

  // Reacciona cuando el padre cambia el usuario seleccionado
  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.errorMessage.set(null);
      this.successMessage.set(null);
      this.editForm.patchValue({
        name: this.user.name,
        isActive: this.user.isActive
      });
    }
  }

  closeModal() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.close.emit();
  }

  async onUpdateSubmit() {
    if (this.editForm.invalid || !this.user) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const updatedUserPayload: User = User.create({
        id: this.user.id,
        name: this.editForm.value.name,
        email: this.user.email,
        password: '',
        isActive: this.editForm.value.isActive,
        createdAt: this.user.createdAt, // Ya es un Date
        updatedAt: new Date()
      });

      console.log(updatedUserPayload, this.user);

      const result = await this.userUseCase.updateUser(updatedUserPayload);

      if (result) {
        // 1. Mostramos la notificación visual verde de éxito
        this.showSuccess('¡Usuario actualizado con éxito!');

        // 2. Esperamos un segundo y medio para que el usuario aprecie el cambio antes de cerrar
        setTimeout(() => {
          this.saved.emit(); // Avisa a la tabla que refresque los datos
        }, 1500);
      }
    } catch (error: any) {
      console.error(error);
      // 3. Capturamos el error directamente en el Toast rojo flotante
      this.showError(error?.error?.message || 'No se pudo actualizar el usuario.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Controladores temporizados para desvanecer las alertas flotantes automáticamente
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
