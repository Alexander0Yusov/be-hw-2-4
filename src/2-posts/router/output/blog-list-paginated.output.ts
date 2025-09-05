import { Post } from '../../types/post';

export type PostListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: (Omit<Post, 'blogId'> & {
    id: string;
    blogId: string;
  })[];
};
