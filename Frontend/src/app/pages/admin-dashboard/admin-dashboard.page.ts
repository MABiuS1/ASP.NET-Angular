import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RoleBadgeComponent } from '../../components/role-badge/role-badge.component';
import {
  DocumentCategory,
  DocumentForm,
  DocumentItem,
  DocumentTimeFilter,
  DocumentTimeOption,
  DocumentTool,
  DocumentViewMode
} from '../../models/document.model';
import {
  PermissionOption,
  PermissionRow,
  UserPermissionRequest
} from '../../models/permission.model';
import { RoleOption } from '../../models/role.model';
import { User, UserForm, UserPayload } from '../../models/user.model';
import {
  ActivityItem,
  ChatMessage,
  Conversation,
  DashboardStat,
  EventItem,
  FaqItem,
  HierarchyUnit,
  MenuKey,
  NotificationItem,
  PhotoItem,
  SavedSearch,
  SettingItem,
  SortOption
} from '../../models/ui.model';
import { PermissionsService } from '../../services/permissions.service';
import { RolesService } from '../../services/roles.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, FormsModule, RoleBadgeComponent],
  templateUrl: './admin-dashboard.page.html',
  styleUrl: './admin-dashboard.page.css'
})
export class AdminDashboardPageComponent implements OnInit {
  activeNav = 'Users';
  openMenu: MenuKey | null = null;

  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService
  ) {}

  searchTerm = '';
  selectedSortId = 'name-asc';
  selectedSavedId = 'all';

  itemsPerPage = 6;
  currentPage = 1;

  isUserModalOpen = false;
  isDeleteModalOpen = false;
  formSubmitted = false;
  editingUserId: string | null = null;

  roleOptions: RoleOption[] = [];
  permissionOptions: PermissionOption[] = [];
  permissionRows: PermissionRow[] = [];
  roleFilters: Record<string, boolean> = {};
  private pendingPermissionIds: string[] | null = null;

  rolesLoading = false;
  permissionsLoading = false;
  usersLoading = false;
  isSavingUser = false;
  usersError = '';
  rolesError = '';
  permissionsError = '';

  itemsPerPageOptions = [6, 8, 10];

  sortOptions: SortOption[] = [
    { id: 'name-asc', label: 'Name (A-Z)' },
    { id: 'name-desc', label: 'Name (Z-A)' },
    { id: 'date-new', label: 'Newest' },
    { id: 'date-old', label: 'Oldest' }
  ];

  savedSearches: SavedSearch[] = [
    { id: 'all', label: 'All users', searchTerm: '', roleIds: [] }
  ];

  notifications: NotificationItem[] = [
    { id: 1, title: 'New signup', detail: '2 users waiting approval', time: '2m ago' },
    { id: 2, title: 'Profile updated', detail: 'Lekan updated profile', time: '1h ago' }
  ];

  users: User[] = [];

  selectedUserForDelete: User | null = null;

  form = this.createEmptyForm();
  formPermissions: PermissionRow[] = [];

  docSearchTerm = '';
  docSortId = 'name-asc';
  docTimeFilter: DocumentTimeFilter = 'this-month';
  docCategoryFilter: DocumentCategory | 'All' = 'Documents';
  docViewMode: DocumentViewMode = 'list';
  docActiveTool: DocumentTool = 'list';
  docFormSubmitted = false;
  isDocModalOpen = false;
  editingDocId: number | null = null;
  selectedDocumentForDelete: DocumentItem | null = null;
  isDocDeleteModalOpen = false;

  docSortOptions: SortOption[] = [
    { id: 'name-asc', label: 'Name (A-Z)' },
    { id: 'name-desc', label: 'Name (Z-A)' },
    { id: 'date-new', label: 'Newest' },
    { id: 'date-old', label: 'Oldest' }
  ];

  docTimeOptions: DocumentTimeOption[] = [
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'all', label: 'All Time' }
  ];

  docCategoryOptions: Array<DocumentCategory | 'All'> = [
    'Documents',
    'Reports',
    'Policies',
    'Templates',
    'All'
  ];

  docFormCategories: DocumentCategory[] = [
    'Documents',
    'Reports',
    'Policies',
    'Templates'
  ];

  docForm: DocumentForm = this.createDocumentForm();

  documents: DocumentItem[] = [
    {
      id: 1,
      title: 'Lorem ipsum',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
      date: this.daysAgo(2),
      category: 'Documents'
    },
    {
      id: 2,
      title: 'Project brief',
      summary: 'Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.',
      date: this.daysAgo(3),
      category: 'Reports'
    },
    {
      id: 3,
      title: 'Design system',
      summary: 'Cras mattis consectetur purus sit amet fermentum. Donec id elit non mi porta gravida.',
      date: this.daysAgo(5),
      category: 'Templates'
    },
    {
      id: 4,
      title: 'Quarterly plan',
      summary: 'Aenean lacinia bibendum nulla sed consectetur. Nullam quis risus eget urna mollis ornare.',
      date: this.daysAgo(8),
      category: 'Policies'
    },
    {
      id: 5,
      title: 'HR handbook',
      summary: 'Maecenas faucibus mollis interdum. Nullam id dolor id nibh ultricies vehicula ut id elit.',
      date: this.daysAgo(10),
      category: 'Policies'
    },
    {
      id: 6,
      title: 'Campaign copy',
      summary: 'Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna.',
      date: this.daysAgo(12),
      category: 'Documents'
    },
    {
      id: 7,
      title: 'Q2 summary',
      summary: 'Donec ullamcorper nulla non metus auctor fringilla. Integer posuere erat a ante venenatis.',
      date: this.daysAgo(15),
      category: 'Reports'
    },
    {
      id: 8,
      title: 'Meeting notes',
      summary: 'Morbi leo risus, porta ac consectetur ac, vestibulum at eros.',
      date: this.daysAgo(18),
      category: 'Documents'
    }
  ];

  dashboardStats: DashboardStat[] = [
    { label: 'Total users', value: '1,280', change: '+12%', trend: 'up' },
    { label: 'Active sessions', value: '312', change: '+5%', trend: 'up' },
    { label: 'Pending requests', value: '28', change: '-3%', trend: 'down' },
    { label: 'Open tickets', value: '14', change: '+2%', trend: 'up' }
  ];

  teamActivity: ActivityItem[] = [
    { title: 'New user onboarding', detail: '4 users completed onboarding', time: '2 hours ago' },
    { title: 'Policy updated', detail: 'Leave policy changed by Admin', time: 'Yesterday' },
    { title: 'Document shared', detail: 'HR shared a new handbook', time: '2 days ago' }
  ];

  upcomingEvents: EventItem[] = [
    { title: 'Monthly review', date: 'May 22, 2025', owner: 'Lekan Okeowo' },
    { title: 'HR sync', date: 'May 26, 2025', owner: 'Ina Hogan' },
    { title: 'Product demo', date: 'May 30, 2025', owner: 'David Wagner' }
  ];

  photoItems: PhotoItem[] = [
    { id: 1, title: 'Team workshop', tag: 'Office', date: 'Apr 18, 2025' },
    { id: 2, title: 'Launch day', tag: 'Events', date: 'Apr 10, 2025' },
    { id: 3, title: 'Product shoot', tag: 'Marketing', date: 'Mar 28, 2025' },
    { id: 4, title: 'Community meetup', tag: 'Events', date: 'Mar 19, 2025' },
    { id: 5, title: 'Workspace refresh', tag: 'Office', date: 'Mar 07, 2025' },
    { id: 6, title: 'Offsite recap', tag: 'Culture', date: 'Feb 22, 2025' }
  ];

  hierarchyUnits: HierarchyUnit[] = [
    { id: 1, name: 'Executive', lead: 'Lekan Okeowo', members: 6, location: 'Lagos' },
    { id: 2, name: 'Product', lead: 'Devin Harmon', members: 18, location: 'Remote' },
    { id: 3, name: 'Operations', lead: 'Ina Hogan', members: 12, location: 'Abuja' },
    { id: 4, name: 'HR & People', lead: 'Victoria Perez', members: 9, location: 'Remote' }
  ];

  conversations: Conversation[] = [
    {
      id: 1,
      name: 'Ina Hogan',
      role: 'HR Admin',
      lastMessage: 'New onboarding list is ready for review.',
      time: '09:32',
      unread: 2
    },
    {
      id: 2,
      name: 'Devin Harmon',
      role: 'Product Lead',
      lastMessage: 'Can we reschedule the demo to Friday?',
      time: 'Yesterday',
      unread: 0
    },
    {
      id: 3,
      name: 'Lena Page',
      role: 'Design',
      lastMessage: 'Uploaded the updated templates.',
      time: 'Mon',
      unread: 1
    }
  ];

  chatMessages: ChatMessage[] = [
    { id: 1, conversationId: 1, author: 'them', text: 'Morning! The onboarding list is ready.', time: '09:20' },
    { id: 2, conversationId: 1, author: 'me', text: 'Great, I will review it today.', time: '09:22' },
    { id: 3, conversationId: 1, author: 'them', text: 'Thanks! Let me know if anything changes.', time: '09:32' },
    { id: 4, conversationId: 2, author: 'them', text: 'Can we reschedule the demo to Friday?', time: 'Yesterday' },
    { id: 5, conversationId: 2, author: 'me', text: 'Friday works for me. 3pm?', time: 'Yesterday' },
    { id: 6, conversationId: 3, author: 'them', text: 'Uploaded the updated templates.', time: 'Mon' },
    { id: 7, conversationId: 3, author: 'me', text: 'Awesome, will share with the team.', time: 'Mon' }
  ];

  activeConversationId = 1;
  draftMessage = '';

  faqs: FaqItem[] = [
    { id: 1, question: 'How do I add a new user?', answer: 'Go to Users, click Add user, and complete the form fields.' },
    { id: 2, question: 'Where can I change permissions?', answer: 'Permissions are managed inside the Add/Edit user modal under Module Permission.' },
    { id: 3, question: 'How do I export documents?', answer: 'Open Documents, select a file, and click the download icon.' },
    { id: 4, question: 'How do I contact support?', answer: 'Use the contact form on the right or email support@yourlogo.com.' }
  ];

  openFaqId: number | null = 1;

  settings: SettingItem[] = [
    {
      id: 1,
      label: 'Email notifications',
      description: 'Receive email alerts for new requests.',
      enabled: true
    },
    {
      id: 2,
      label: 'Two-factor authentication',
      description: 'Require a verification code on login.',
      enabled: false
    },
    {
      id: 3,
      label: 'Weekly summary',
      description: 'Send a weekly summary to your inbox.',
      enabled: true
    },
    {
      id: 4,
      label: 'Dark mode',
      description: 'Enable a darker UI theme in the evening.',
      enabled: false
    }
  ];

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
    this.loadUsers();
  }

  @HostListener('document:click')
  handleDocumentClick(): void {
    this.openMenu = null;
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.usersError = '';
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.usersLoading = false;
        this.currentPage = 1;
      },
      error: () => {
        this.usersError = 'Unable to load users. Please try again.';
        this.usersLoading = false;
      }
    });
  }

  loadRoles(): void {
    this.rolesLoading = true;
    this.rolesError = '';
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roleOptions = roles;
        this.roleFilters = Object.fromEntries(
          this.roleOptions.map((role) => [role.id, true])
        );
        this.buildSavedSearches();
        this.rolesLoading = false;
      },
      error: () => {
        this.rolesError = 'Unable to load roles.';
        this.rolesLoading = false;
      }
    });
  }

  loadPermissions(): void {
    this.permissionsLoading = true;
    this.permissionsError = '';
    this.permissionsService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissionOptions = permissions;
          this.permissionRows = this.buildPermissionRows(this.permissionOptions);
          if (this.pendingPermissionIds) {
            this.formPermissions = this.mapPermissionIdsToRows(this.pendingPermissionIds);
            this.pendingPermissionIds = null;
          } else if (this.isUserModalOpen && this.editingUserId) {
            const editingUser = this.users.find((user) => user.id === this.editingUserId);
            this.formPermissions = editingUser
              ? this.mapPermissionIdsToRows(editingUser.permissionIds)
              : this.clonePermissionRows(this.permissionRows);
          } else {
            this.formPermissions = this.clonePermissionRows(this.permissionRows);
          }
          this.permissionsLoading = false;
        },
      error: () => {
        this.permissionsError = 'Unable to load permissions.';
        this.permissionsLoading = false;
      }
    });
  }

  setActiveNav(label: string, event: Event): void {
    event.preventDefault();
    this.activeNav = label;
    this.openMenu = null;
    this.isUserModalOpen = false;
    this.isDeleteModalOpen = false;
    this.isDocModalOpen = false;
    this.isDocDeleteModalOpen = false;
  }

  toggleMenu(menu: MenuKey, event: Event): void {
    event.stopPropagation();
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.selectedSavedId = 'custom';
  }

  setSort(sortId: string): void {
    this.selectedSortId = sortId;
    this.currentPage = 1;
    this.openMenu = null;
  }

  applySavedSearch(preset: SavedSearch): void {
    this.selectedSavedId = preset.id;
    this.searchTerm = preset.searchTerm;
    if (preset.roleIds.length === 0) {
      this.resetFilters(false);
    } else {
      this.roleOptions.forEach((role) => {
        this.roleFilters[role.id] = preset.roleIds.includes(role.id);
      });
    }
    this.currentPage = 1;
    this.openMenu = null;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.selectedSavedId = 'custom';
  }

  resetFilters(updateSavedSearch = true): void {
    this.roleOptions.forEach((role) => {
      this.roleFilters[role.id] = true;
    });
    this.currentPage = 1;
    if (updateSavedSearch) {
      this.selectedSavedId = 'custom';
    }
  }

  setItemsPerPage(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.openMenu = null;
  }

  nextPage(): void {
    if (this.currentPage < this.pageCount) {
      this.currentPage += 1;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  openAddUser(): void {
    this.editingUserId = null;
    this.formSubmitted = false;
    this.form = this.createEmptyForm();
    this.pendingPermissionIds = null;
    this.ensureRolesLoaded();
    this.ensurePermissionsLoaded();
    this.formPermissions = this.clonePermissionRows(this.permissionRows);
    this.isUserModalOpen = true;
    this.openMenu = null;
  }

  openEditUser(user: User): void {
    this.editingUserId = user.id;
    this.formSubmitted = false;
    this.form = {
      userId: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.phone ?? '',
      roleId: user.roleId,
      username: user.username,
      password: '',
      confirmPassword: ''
    };
    this.pendingPermissionIds = user.permissionIds;
    this.ensureRolesLoaded();
    this.ensurePermissionsLoaded();
    this.formPermissions =
      this.permissionRows.length > 0
        ? this.mapPermissionIdsToRows(user.permissionIds)
        : [];
    this.isUserModalOpen = true;
    this.openMenu = null;
  }

  closeUserModal(): void {
    this.isUserModalOpen = false;
    this.pendingPermissionIds = null;
  }

  saveUser(): void {
    this.formSubmitted = true;
    if (!this.isFormValid) {
      return;
    }

    const payload = this.buildUserPayload();
    this.isSavingUser = true;
    this.usersError = '';

    if (this.editingUserId) {
      this.usersService.updateUser(this.editingUserId, payload).subscribe({
        next: (updated) => {
          this.users = this.users.map((user) => (user.id === updated.id ? updated : user));
          this.finishSaveUser();
        },
        error: () => {
          this.usersError = 'Unable to update user.';
          this.isSavingUser = false;
        }
      });
      return;
    }

    this.usersService.createUser(payload).subscribe({
      next: (created) => {
        this.users = [created, ...this.users];
        this.finishSaveUser();
      },
      error: () => {
        this.usersError = 'Unable to create user.';
        this.isSavingUser = false;
      }
    });
  }

  private finishSaveUser(): void {
    this.isSavingUser = false;
    this.isUserModalOpen = false;
    this.editingUserId = null;
    this.formSubmitted = false;
    this.currentPage = 1;
  }

  confirmDeleteUser(user: User): void {
    this.selectedUserForDelete = user;
    this.isDeleteModalOpen = true;
    this.openMenu = null;
  }

  cancelDelete(): void {
    this.selectedUserForDelete = null;
    this.isDeleteModalOpen = false;
  }

  deleteUser(): void {
    if (this.selectedUserForDelete) {
      const targetId = this.selectedUserForDelete.id;
      this.usersService.deleteUser(targetId).subscribe({
        next: () => {
          this.users = this.users.filter((user) => user.id !== targetId);
          this.selectedUserForDelete = null;
          this.isDeleteModalOpen = false;
          this.currentPage = Math.min(this.currentPage, this.pageCount);
        },
        error: () => {
          this.usersError = 'Unable to delete user.';
        }
      });
    }
  }

  onDocSearchChange(): void {
    this.openMenu = null;
  }

  setDocSort(sortId: string): void {
    this.docSortId = sortId;
    this.openMenu = null;
  }

  setDocCategory(category: DocumentCategory | 'All'): void {
    this.docCategoryFilter = category;
    this.openMenu = null;
  }

  setDocTool(tool: DocumentTool): void {
    this.docActiveTool = tool;
    if (tool === 'list' || tool === 'grid') {
      this.docViewMode = tool;
    }
  }

  openAddDocument(): void {
    this.editingDocId = null;
    this.docFormSubmitted = false;
    this.docForm = this.createDocumentForm();
    this.isDocModalOpen = true;
  }

  openEditDocument(document: DocumentItem): void {
    this.editingDocId = document.id;
    this.docFormSubmitted = false;
    this.docForm = {
      title: document.title,
      summary: document.summary,
      date: this.formatDateInput(document.date),
      category: document.category
    };
    this.isDocModalOpen = true;
  }

  closeDocModal(): void {
    this.isDocModalOpen = false;
  }

  saveDocument(): void {
    this.docFormSubmitted = true;
    if (!this.isDocFormValid) {
      return;
    }

    if (this.editingDocId) {
      const existing = this.documents.find((doc) => doc.id === this.editingDocId);
      if (existing) {
        existing.title = this.docForm.title.trim();
        existing.summary = this.docForm.summary.trim();
        existing.category = this.docForm.category;
        existing.date = new Date(this.docForm.date);
      }
    } else {
      const nextId = this.documents.length
        ? Math.max(...this.documents.map((doc) => doc.id)) + 1
        : 1;
      const newDoc: DocumentItem = {
        id: nextId,
        title: this.docForm.title.trim(),
        summary: this.docForm.summary.trim(),
        category: this.docForm.category,
        date: new Date(this.docForm.date)
      };
      this.documents = [newDoc, ...this.documents];
    }

    this.isDocModalOpen = false;
    this.editingDocId = null;
    this.docFormSubmitted = false;
  }

  confirmDeleteDocument(document: DocumentItem): void {
    this.selectedDocumentForDelete = document;
    this.isDocDeleteModalOpen = true;
  }

  cancelDocDelete(): void {
    this.selectedDocumentForDelete = null;
    this.isDocDeleteModalOpen = false;
  }

  deleteDocument(): void {
    if (this.selectedDocumentForDelete) {
      this.documents = this.documents.filter((doc) => doc.id !== this.selectedDocumentForDelete?.id);
      this.selectedDocumentForDelete = null;
      this.isDocDeleteModalOpen = false;
    }
  }

  selectConversation(conversation: Conversation): void {
    this.activeConversationId = conversation.id;
  }

  toggleFaq(faqId: number): void {
    this.openFaqId = this.openFaqId === faqId ? null : faqId;
  }

  sendMessage(): void {
    const message = this.draftMessage.trim();
    if (!message) {
      return;
    }

    const nextId = this.chatMessages.length
      ? Math.max(...this.chatMessages.map((item) => item.id)) + 1
      : 1;

    const newMessage: ChatMessage = {
      id: nextId,
      conversationId: this.activeConversationId,
      author: 'me',
      text: message,
      time: 'Now'
    };

    this.chatMessages = [...this.chatMessages, newMessage];
    const conversation = this.conversations.find(
      (item) => item.id === this.activeConversationId
    );
    if (conversation) {
      conversation.lastMessage = message;
      conversation.time = 'Now';
      conversation.unread = 0;
    }
    this.draftMessage = '';
  }

  get filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    const activeRoleIds = this.activeRoleIds;

    return this.users.filter((user) => {
      const matchesTerm =
        !term ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        (user.phone ?? '').toLowerCase().includes(term) ||
        user.roleName.toLowerCase().includes(term);

      const matchesType =
        activeRoleIds.length === this.roleOptions.length
          ? true
          : activeRoleIds.includes(user.roleId);

      return matchesTerm && matchesType;
    });
  }

  get sortedUsers(): User[] {
    const sorted = [...this.filteredUsers];

    switch (this.selectedSortId) {
      case 'name-desc':
        return sorted.sort((a, b) => this.fullName(b).localeCompare(this.fullName(a)));
      case 'date-new':
        return sorted.sort(
          (a, b) =>
            (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );
      case 'date-old':
        return sorted.sort(
          (a, b) =>
            (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
        );
      case 'name-asc':
      default:
        return sorted.sort((a, b) => this.fullName(a).localeCompare(this.fullName(b)));
    }
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.sortedUsers.slice(start, start + this.itemsPerPage);
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.sortedUsers.length / this.itemsPerPage));
  }

  get totalUsers(): number {
    return this.sortedUsers.length;
  }

  get rangeStart(): number {
    if (this.sortedUsers.length === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.sortedUsers.length, this.currentPage * this.itemsPerPage);
  }

  get activeRoleIds(): string[] {
    return this.roleOptions
      .filter((role) => this.roleFilters[role.id])
      .map((role) => role.id);
  }

  get isFormValid(): boolean {
    const requiredFieldsFilled =
      this.form.userId.trim().length > 0 &&
      this.form.firstName.trim().length > 0 &&
      this.form.lastName.trim().length > 0 &&
      this.form.email.trim().length > 0 &&
      this.form.username.trim().length > 0 &&
      !!this.form.roleId;

    if (!requiredFieldsFilled) {
      return false;
    }

    const hasPassword = this.form.password.trim().length > 0;
    const hasConfirm = this.form.confirmPassword.trim().length > 0;
    const passwordsMatch = this.form.password === this.form.confirmPassword;

    if (!this.editingUserId) {
      return hasPassword && hasConfirm && passwordsMatch;
    }

    if (!hasPassword && !hasConfirm) {
      return true;
    }

    return passwordsMatch;
  }

  get isPasswordMismatch(): boolean {
    if (!this.formSubmitted) {
      return false;
    }
    if (!this.form.password && !this.form.confirmPassword) {
      return false;
    }
    return this.form.password !== this.form.confirmPassword;
  }

  get docSortLabel(): string {
    return this.docSortOptions.find((option) => option.id === this.docSortId)?.label ?? 'Sort by';
  }

  get docFilteredDocuments(): DocumentItem[] {
    const term = this.docSearchTerm.trim().toLowerCase();
    const now = new Date();

    return this.documents.filter((doc) => {
      const matchesTerm =
        !term ||
        doc.title.toLowerCase().includes(term) ||
        doc.summary.toLowerCase().includes(term);

      const matchesCategory =
        this.docCategoryFilter === 'All' ? true : doc.category === this.docCategoryFilter;

      let matchesTime = true;
      if (this.docTimeFilter !== 'all') {
        const docMonth = doc.date.getMonth();
        const docYear = doc.date.getFullYear();
        if (this.docTimeFilter === 'this-month') {
          matchesTime = docMonth === now.getMonth() && docYear === now.getFullYear();
        } else {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          matchesTime = docMonth === lastMonth.getMonth() && docYear === lastMonth.getFullYear();
        }
      }

      return matchesTerm && matchesCategory && matchesTime;
    });
  }

  get docSortedDocuments(): DocumentItem[] {
    const sorted = [...this.docFilteredDocuments];

    switch (this.docSortId) {
      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-new':
        return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'date-old':
        return sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
      case 'name-asc':
      default:
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  get activeConversation(): Conversation | undefined {
    return this.conversations.find((conversation) => conversation.id === this.activeConversationId);
  }

  get activeMessages(): ChatMessage[] {
    return this.chatMessages.filter(
      (message) => message.conversationId === this.activeConversationId
    );
  }

  get isDocFormValid(): boolean {
    return this.docForm.title.trim().length > 0 && this.docForm.date.trim().length > 0;
  }

  private buildUserPayload(): UserPayload {
    return {
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      email: this.form.email.trim(),
      phone: this.form.mobile.trim() ? this.form.mobile.trim() : null,
      roleId: this.form.roleId,
      username: this.resolveUsername(),
      password: this.form.password.trim() ? this.form.password.trim() : null,
      permissions: this.buildPermissionRequests(this.formPermissions)
    };
  }

  private buildSavedSearches(): void {
    const adminRoleIds = this.roleOptions
      .filter((role) => role.name.toLowerCase().includes('admin'))
      .map((role) => role.id);
    const userRoleIds = this.roleOptions
      .filter((role) => role.name.toLowerCase().includes('user'))
      .map((role) => role.id);

    const saved: SavedSearch[] = [
      { id: 'all', label: 'All users', searchTerm: '', roleIds: [] }
    ];

    if (adminRoleIds.length > 0) {
      saved.push({ id: 'admins', label: 'Admins', searchTerm: '', roleIds: adminRoleIds });
    }

    if (userRoleIds.length > 0) {
      saved.push({ id: 'users', label: 'Users', searchTerm: '', roleIds: userRoleIds });
    }

    this.savedSearches = saved;
    if (!saved.some((item) => item.id === this.selectedSavedId)) {
      this.selectedSavedId = 'all';
    }
  }

  private buildPermissionRows(options: PermissionOption[]): PermissionRow[] {
    const rows = new Map<string, PermissionRow>();

    options.forEach((option) => {
      const key = option.module;
      if (!rows.has(key)) {
        rows.set(key, { module: key, read: false, write: false, delete: false });
      }
      const row = rows.get(key);
      if (!row) {
        return;
      }
      switch (option.action) {
        case 'read':
          row.readId = option.id;
          break;
        case 'write':
          row.writeId = option.id;
          break;
        case 'delete':
          row.deleteId = option.id;
          break;
        default:
          if (!row.readId) {
            row.readId = option.id;
          }
          break;
      }
    });

    return Array.from(rows.values()).sort((a, b) => a.module.localeCompare(b.module));
  }

  private ensureRolesLoaded(): void {
    if (this.roleOptions.length === 0 && !this.rolesLoading) {
      this.loadRoles();
    }
  }

  private ensurePermissionsLoaded(): void {
    if (
      (this.permissionOptions.length === 0 || this.permissionsError.length > 0) &&
      !this.permissionsLoading
    ) {
      this.loadPermissions();
    }
  }

  private clonePermissionRows(rows: PermissionRow[]): PermissionRow[] {
    return rows.map((row) => ({
      module: row.module,
      read: row.read ?? false,
      write: row.write ?? false,
      delete: row.delete ?? false,
      readId: row.readId,
      writeId: row.writeId,
      deleteId: row.deleteId
    }));
  }

  private mapPermissionIdsToRows(permissionIds: string[]): PermissionRow[] {
    const idSet = new Set(permissionIds);
    return this.permissionRows.map((row) => ({
      module: row.module,
      read: row.readId ? idSet.has(row.readId) : false,
      write: row.writeId ? idSet.has(row.writeId) : false,
      delete: row.deleteId ? idSet.has(row.deleteId) : false,
      readId: row.readId,
      writeId: row.writeId,
      deleteId: row.deleteId
    }));
  }

  private buildPermissionRequests(rows: PermissionRow[]): UserPermissionRequest[] {
    const payload: UserPermissionRequest[] = [];

    rows.forEach((row) => {
      if (row.read && row.readId) {
        payload.push({
          permissionId: row.readId,
          isReadable: true,
          isWritable: false,
          isDeletable: false
        });
      }
      if (row.write && row.writeId) {
        payload.push({
          permissionId: row.writeId,
          isReadable: false,
          isWritable: true,
          isDeletable: false
        });
      }
      if (row.delete && row.deleteId) {
        payload.push({
          permissionId: row.deleteId,
          isReadable: false,
          isWritable: false,
          isDeletable: true
        });
      }
    });

    return payload;
  }

  private resolveUsername(): string {
    const direct = this.form.username.trim();
    return direct.length > 0 ? direct : this.form.userId.trim();
  }

  fullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  private createEmptyForm(): UserForm {
    return {
      userId: '',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      roleId: '',
      username: '',
      password: '',
      confirmPassword: ''
    };
  }

  private createDocumentForm(): DocumentForm {
    return {
      title: '',
      summary: '',
      date: '',
      category: 'Documents'
    };
  }

  private daysAgo(days: number): Date {
    const date = new Date();
    const safeDays = Math.min(days, date.getDate() - 1);
    date.setDate(date.getDate() - safeDays);
    return date;
  }

  private formatDateInput(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
