import {User} from '../../domain/User';

export class UserMapper {

  /**
   * Traduce del Frontend (Dominio) hacia el Backend (DTO)
   */
  static toBackendDto(user: Partial<User>) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      createdAt: user.createdAt?.toISOString().substring(0, 19),
      updatedAt: user.updatedAt?.toISOString().substring(0, 19)
    };
  }

  /**
   * Traduce del Backend (DTO) hacia el Frontend (Dominio)
   */
  static toDomain(backendUser: any): User {
    return User.create({
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email || backendUser.username || '',
      isActive: backendUser.isActive,
      createdAt: new Date(backendUser.createdAt),
      updatedAt: new Date(backendUser.updatedAt),
      password: backendUser.password || ''
    });
  }
}
