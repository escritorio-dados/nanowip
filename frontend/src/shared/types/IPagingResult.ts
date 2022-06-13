export type IPagingResult<T> =
  | {
      pagination: { page: number; total_results: number; total_pages: number };
      data: T[];
    }
  | undefined;
