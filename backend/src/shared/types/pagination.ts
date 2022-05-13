export type IResponsePagination<T> = {
  pagination: {
    total_results: number;
    total_pages: number;
    page: number;
  };
  data: T;
};

export const paginationSize = 10;

export const paginationSizeLarge = 25;
