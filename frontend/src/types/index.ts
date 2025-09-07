export interface BaseResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
