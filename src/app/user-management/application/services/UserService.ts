import {inject, Injectable} from '@angular/core';
import {UserRepository} from '../output/UserRepository';
import {User} from '../../domain/User';
import {UserInPort} from '../input/UserInPort';

@Injectable({
  providedIn: 'root'
})
export class UserService implements UserInPort {

  private readonly userRepository = inject(UserRepository);

  async createUser(user: Partial<User>): Promise<User> {
    return await this.userRepository.save(user);
  }

  async getUser(id: number): Promise<User | null> {
    return await this.userRepository.getById(id);
  }

  async updateUser(user: User): Promise<User> {
    return await this.userRepository.update(user);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
