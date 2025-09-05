import { WithId } from 'mongodb';
import { Blog } from '../types/blog';
import { BlogListPaginatedOutput } from '../router/output/blog-list-paginated.output';
import { mapToBlogViewModel } from './map-to-blog-view-model.util';

export function mapToBlogListPaginatedOutput(
  blogs: WithId<Blog>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number },
): BlogListPaginatedOutput {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,

    items: blogs.map(mapToBlogViewModel),
  };
}
