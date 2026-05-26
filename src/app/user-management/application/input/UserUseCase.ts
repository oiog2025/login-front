import {User} from '../../domain/User';

export abstract class UserUseCase {

  abstract createUser(user: Partial<User>): Promise<User>;

  abstract updateUser(user: User): Promise<User>;

  abstract deleteUser(id: number): Promise<void>;

  abstract getAllUsers(): Promise<User[]>;
}
