import { Component, Input } from '@angular/core';

import { UserRoleName } from '../../models/user.model';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  templateUrl: './role-badge.component.html',
  styleUrl: './role-badge.component.css'
})
export class RoleBadgeComponent {
  @Input() roleName: UserRoleName = '';

  get badgeClass(): string {
    const normalized = this.roleName.toLowerCase();
    return normalized.includes('user') || normalized.includes('employee')
      ? 'badge badge-neutral'
      : 'badge badge-primary';
  }
}
