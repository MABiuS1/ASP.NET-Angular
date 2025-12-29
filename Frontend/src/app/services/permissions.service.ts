import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../models/api.model';
import { PermissionAction, PermissionDto, PermissionOption } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly apiBaseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getPermissions() {
    return this.http
      .get<ApiResponse<PermissionDto[]>>(`${this.apiBaseUrl}/permissions`)
      .pipe(map((response) => (response.data ?? []).map((p) => this.mapPermissionOption(p))));
  }

  private mapPermissionOption(permission: PermissionDto): PermissionOption {
    const parts = permission.permissionName.split('.');
    const actionName = parts.length > 1 ? parts.pop() : 'read';
    const moduleName = parts.length > 0 ? parts.join('.') : permission.permissionName;
    const action = (actionName ?? 'read').toLowerCase();

    return {
      id: permission.permissionId,
      name: permission.permissionName,
      module: moduleName || permission.permissionName,
      action: this.normalizeAction(action)
    };
  }

  private normalizeAction(action: string): PermissionAction {
    if (action === 'write' || action === 'delete') {
      return action;
    }
    return 'read';
  }
}
