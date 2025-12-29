export type PermissionAction = 'read' | 'write' | 'delete';

export interface PermissionDto {
  permissionId: string;
  permissionName: string;
}

export interface PermissionOption {
  id: string;
  name: string;
  module: string;
  action: PermissionAction;
}

export interface PermissionRow {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  readId?: string;
  writeId?: string;
  deleteId?: string;
}

export interface UserPermissionRequest {
  permissionId: string;
  isReadable: boolean;
  isWritable: boolean;
  isDeletable: boolean;
}
