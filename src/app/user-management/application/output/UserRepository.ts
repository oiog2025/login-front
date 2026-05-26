import {User} from '../../domain/User';
import {AuthTokens} from '../input/AuthUseCase';

export abstract class UserRepository {

  abstract authenticate(email: string, password: string): Promise<AuthTokens | null>;

  abstract save(user: Partial<User>): Promise<User>;

  abstract getById(id: number): Promise<User | null>;

  abstract update(user: User): Promise<User>;

  abstract delete(id: number): Promise<void>;

  abstract findAll(): Promise<User[]>;

  abstract logout(refreshToken: string): Promise<string | null>;
}
