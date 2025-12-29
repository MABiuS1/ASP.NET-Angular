export interface ApiStatus {
  code: string;
  description: string;
}

export interface ApiResponse<T> {
  data: T;
  status?: ApiStatus;
}
