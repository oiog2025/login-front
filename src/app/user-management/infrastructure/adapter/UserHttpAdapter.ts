import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {UserRepository} from '../../application/output/UserRepository';
import {User} from '../../domain/User';
import {AuthTokens} from '../../application/input/AuthUseCase';
import {ApiResponseDto} from '../dtos/ApiResponseDto';
import {TokenResponseDTO} from '../dtos/TokenResponseDTO';
import {UserBackendDto} from '../dtos/UserBackendDto';
import {UserMapper} from '../mappers/UserMapper';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserHttpAdapter implements UserRepository {


  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;


  async authenticate(email: string, password: string): Promise<AuthTokens | null> {
    const request$ = this.http.post<ApiResponseDto<TokenResponseDTO>>(`${this.API_URL}/login`, {
      username: email,
      password: password
    });

    const response = await firstValueFrom(request$);
    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken
    };
  }

  async save(user: Partial<User>): Promise<User> {
    console.log('Datos recibidos en el adaptador desde el dominio:', user);
    const bodyParaBackend = UserMapper.toBackendDto(user);

    console.log('Carga útil final que se envía a Java:', bodyParaBackend);

    const request$ = this.http.post<ApiResponseDto<UserBackendDto>>(`${this.API_URL}/create`, bodyParaBackend);
    const response = await firstValueFrom(request$);
    return UserMapper.toDomain(response.data);
  }

  async getById(id: number): Promise<User | null> {
    const request$ = this.http.get<ApiResponseDto<UserBackendDto>>(`${this.API_URL}/users/${id}`);
    const response = await firstValueFrom(request$);
    return UserMapper.toDomain(response.data);
  }

  async update(user: User): Promise<User> {
    const bodyParaBackend = UserMapper.toBackendDto(user);
    const request$ = this.http.put<ApiResponseDto<UserBackendDto>>(`${this.API_URL}/update`, bodyParaBackend);
    const response = await firstValueFrom(request$);
    return UserMapper.toDomain(response.data);
  }

  async delete(id: number): Promise<void> {
    const request$ = this.http.delete<ApiResponseDto<void>>(`${this.API_URL}/users/${id}`);
    await firstValueFrom(request$);
  }

  async findAll(): Promise<User[]> {
    const request$ = this.http.get<ApiResponseDto<UserBackendDto[]>>(`${this.API_URL}/users`);
    const response = await firstValueFrom(request$);
    return response.data.map(userBackend => UserMapper.toDomain(userBackend));
  }

  async logout(refreshToken: string): Promise<string | null> {
    const request$ = this.http.post<ApiResponseDto<TokenResponseDTO>>(`${this.API_URL}/logout`, {
      refreshToken: refreshToken
    });
    const response = await firstValueFrom(request$);
    return response.data.refreshToken
  }
  
}
