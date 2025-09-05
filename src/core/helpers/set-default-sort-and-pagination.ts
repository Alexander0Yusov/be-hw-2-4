import { paginationAndSortingDefault } from '../middlewares/validation/query-pagination-sorting.validation-middleware';
import { PaginationAndSorting } from '../types/pagination-and-sorting';

export function setDefaultSortAndPaginationIfNotExist<P = string>(
  query: Partial<PaginationAndSorting<P>>,
): PaginationAndSorting<P> {
  return {
    ...paginationAndSortingDefault,
    ...query,
    sortBy: (query.sortBy ?? paginationAndSortingDefault.sortBy) as P,
  };
}
