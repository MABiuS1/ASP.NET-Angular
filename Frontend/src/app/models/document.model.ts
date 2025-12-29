export type DocumentCategory = 'Documents' | 'Reports' | 'Policies' | 'Templates';
export type DocumentTimeFilter = 'this-month' | 'last-month' | 'all';
export type DocumentViewMode = 'list' | 'grid';
export type DocumentTool = 'list' | 'grid' | 'download' | 'print' | 'trash';

export interface DocumentItem {
  id: number;
  title: string;
  summary: string;
  date: Date;
  category: DocumentCategory;
}

export interface DocumentForm {
  title: string;
  summary: string;
  date: string;
  category: DocumentCategory;
}

export interface DocumentTimeOption {
  id: DocumentTimeFilter;
  label: string;
}
