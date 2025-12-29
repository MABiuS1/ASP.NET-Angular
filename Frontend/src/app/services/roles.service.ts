import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../models/api.model';
import { RoleDto, RoleOption } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly apiBaseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getRoles() {
    return this.http.get<ApiResponse<RoleDto[]>>(`${this.apiBaseUrl}/roles`).pipe(
      map((response) =>
        (response.data ?? []).map((role) => ({ id: role.roleId, name: role.roleName }))
      )
    );
  }
}
