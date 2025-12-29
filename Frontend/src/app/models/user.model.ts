import { PermissionDto, UserPermissionRequest } from './permission.model';
import { RoleDto } from './role.model';

export type UserRoleName = string;

export interface UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string | null;
  role: RoleDto;
  permissions: PermissionDto[];
  createdDate?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string | null;
  roleId: string;
  roleName: UserRoleName;
  createdAt?: Date | null;
  permissionIds: string[];
}

export interface UserForm {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  roleId: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  roleId: string;
  username: string;
  password: string | null;
  permissions: UserPermissionRequest[];
}
