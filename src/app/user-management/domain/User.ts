export class User {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public password?: string
  ) {
  }

  /**
   * Método de factoría: La forma oficial de crear usuarios en el frontend.
   * Útil para centralizar validaciones de dominio si se requieren en el futuro.
   */
  static create(data: {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    password?: string;
  }): User {
    return new User(
      data.id,
      data.name,
      data.email,
      data.isActive,
      data.createdAt,
      data.updatedAt,
      data.password
    );
  }

  /**
   * Comportamiento: Activa al usuario y actualiza su fecha de modificación.
   */
  public activate(): void {
    this.isActive = true;
    this.markAsUpdated();
  }

  /**
   * Centraliza la lógica de actualización de tiempo.
   */
  private markAsUpdated(): void {
    this.updatedAt = new Date();
  }
}
