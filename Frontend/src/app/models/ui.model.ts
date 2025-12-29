export type MenuKey =
  | 'sort'
  | 'saved'
  | 'filter'
  | 'items'
  | 'profile'
  | 'notifications'
  | 'docSort'
  | 'docFilter';

export interface SortOption {
  id: string;
  label: string;
}

export interface SavedSearch {
  id: string;
  label: string;
  searchTerm: string;
  roleIds: string[];
}

export interface NotificationItem {
  id: number;
  title: string;
  detail: string;
  time: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface ActivityItem {
  title: string;
  detail: string;
  time: string;
}

export interface EventItem {
  title: string;
  date: string;
  owner: string;
}

export interface PhotoItem {
  id: number;
  title: string;
  tag: string;
  date: string;
}

export interface HierarchyUnit {
  id: number;
  name: string;
  lead: string;
  members: number;
  location: string;
}

export interface Conversation {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export type MessageAuthor = 'me' | 'them';

export interface ChatMessage {
  id: number;
  conversationId: number;
  author: MessageAuthor;
  text: string;
  time: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface SettingItem {
  id: number;
  label: string;
  description: string;
  enabled: boolean;
}
