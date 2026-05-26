export interface UserBackendDto {
  id: number;
  name: string;
  username: string;
  email?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  password?: string;
}
