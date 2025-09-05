import { BlogViewModel } from '../../types/blog-view-model';

export type BlogListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogViewModel[];
};
