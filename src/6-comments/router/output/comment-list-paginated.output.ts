import { CommentViewModel } from '../../types/comment-view-model';

export type CommentListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentViewModel[];
};
