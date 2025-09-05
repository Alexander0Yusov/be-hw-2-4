import { query } from 'express-validator';
import { SortDirection } from '../../types/sort-direction';
import { PaginationAndSorting } from '../../types/pagination-and-sorting';

// Дефолтные значения
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_DIRECTION = SortDirection.Desc;
const DEFAULT_SORT_BY = 'createdAt';

export const paginationAndSortingDefault: PaginationAndSorting<string> = {
  pageNumber: DEFAULT_PAGE_NUMBER,
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: DEFAULT_SORT_BY,
  sortDirection: DEFAULT_SORT_DIRECTION,
};

export function paginationAndSortingValidation<T extends string>(
  sortFieldsEnum: Record<string, T>,
) {
  const allowedSortFields = Object.values(sortFieldsEnum);

  return [
    query('pageNumber')
      .optional()
      .default(DEFAULT_PAGE_NUMBER)
      .isInt({ min: 1 })
      .withMessage('Page number must be a positive integer')
      .toInt(),

    query('pageSize')
      .optional()
      .default(DEFAULT_PAGE_SIZE)
      .isInt({ min: 1, max: 100 })
      .withMessage('Page size must be between 1 and 100')
      .toInt(),

    query('sortBy')
      .optional()
      .default(Object.values(sortFieldsEnum)[0]) // Первое значение enum как дефолтное
      .isIn(allowedSortFields)
      .withMessage(
        `Invalid sort field. Allowed values: ${allowedSortFields.join(', ')}`,
      ),

    query('sortDirection')
      .optional()
      .default(DEFAULT_SORT_DIRECTION)
      .isIn(Object.values(SortDirection))
      .withMessage(
        `Sort direction must be one of: ${Object.values(SortDirection).join(', ')}`,
      ),
  ];
}
