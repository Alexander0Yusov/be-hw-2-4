import { SortDirection } from './sort-direction';
// import {SortDirection} from 'mongodb'

export type PaginationAndSorting<S> = {
  pageNumber: number;
  pageSize: number;
  sortBy: S;
  sortDirection: SortDirection;
};
