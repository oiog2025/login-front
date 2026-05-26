import {Component, inject, OnInit, signal} from '@angular/core';
import {UserUseCase} from '../../application/input/UserUseCase';
import {User} from '../../domain/User';
import {UserEditModalComponent} from '../user-edit-modal/user-edit-modal.component';
import {Router} from '@angular/router';
import {AuthService} from '../../application/services/AuthService';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    UserEditModalComponent
  ],
  templateUrl: 'user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {

  public users = signal<User[]>([]);
  public isLoading = signal<boolean>(true);
  public errorMessage = signal<string | null>(null);
  public isModalOpen = signal<boolean>(false);
  public selectedUser = signal<User | null>(null);
  // Nuevos Signals para el Modal de Eliminación
  public isDeleteModalOpen = signal<boolean>(false);
  public userToDeleteId = signal<number | null>(null);
  private userUseCase = inject(UserUseCase);
  private router = inject(Router);
  private authService = inject(AuthService);

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      // Intentamos traer los usuarios del backend
      this.users.set(await this.userUseCase.getAllUsers());

    } catch (error: any) {
      this.errorMessage.set(error.error.message);
      console.error('Error en la petición:', error);

      // Si el backend responde 404 (Excepción controlada de "No hay usuarios")
      if (error?.status === 404) {
        this.users.set([]);
      } else {
        // Si es cualquier otro error (500 Internal Error, problemas de red, etc.)
        this.errorMessage.set('Ocurrió un error inesperado al conectar con el servidor.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  openEditModal(user: User) {
    this.selectedUser.set(user);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
  }

  async onUserSaved() {
    this.closeModal();
    await this.loadUsers();
  }

  openDeleteModal(id: number) {
    this.userToDeleteId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.userToDeleteId.set(null);
  }

  async confirmDeleteUser() {
    const id = this.userToDeleteId();
    if (id === null) return; // Validación por seguridad

    try {
      this.isLoading.set(true);
      this.closeDeleteModal(); // Cerramos el modal visualmente de inmediato

      // 1. Llamamos al puerto para impactar el backend
      await this.userUseCase.deleteUser(id);

      // 2. Recargamos la lista directamente desde el servidor
      await this.loadUsers();
    } catch (error) {
      this.errorMessage.set('No se pudo eliminar el usuario seleccionado.');
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    void this.router.navigate(['/login']);
  }

  async logout() {
    const currentRefreshToken = localStorage.getItem('refresh_token') || '';
    await this.authService.logout(currentRefreshToken);
  }
}
