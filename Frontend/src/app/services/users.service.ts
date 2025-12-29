import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../models/api.model';
import { User, UserPayload, UserResponseDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly apiBaseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getUsers() {
    return this.http.get<ApiResponse<UserResponseDto[]>>(`${this.apiBaseUrl}/users`).pipe(
      map((response) => (response.data ?? []).map((user) => this.mapUserResponse(user)))
    );
  }

  createUser(payload: UserPayload) {
    return this.http
      .post<ApiResponse<UserResponseDto>>(`${this.apiBaseUrl}/users`, payload)
      .pipe(map((response) => this.mapUserResponse(response.data)));
  }

  updateUser(id: string, payload: UserPayload) {
    return this.http
      .put<ApiResponse<UserResponseDto>>(`${this.apiBaseUrl}/users/${id}`, payload)
      .pipe(map((response) => this.mapUserResponse(response.data)));
  }

  deleteUser(id: string) {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.apiBaseUrl}/users/${id}`)
      .pipe(map(() => undefined));
  }

  private mapUserResponse(user: UserResponseDto): User {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      phone: user.phone ?? null,
      roleId: user.role.roleId,
      roleName: user.role.roleName,
      createdAt: user.createdDate ? new Date(user.createdDate) : null,
      permissionIds: (user.permissions ?? []).map((permission) => permission.permissionId)
    };
  }
}
