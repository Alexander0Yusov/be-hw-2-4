import { BlogInputDto } from '../../../1-blogs/dto/blog-input.dto';

const testBlogData: BlogInputDto = {
  name: 'blog 1',
  description: 'desc blog 1',
  websiteUrl: 'https://www.youtube.com/watch?v=DqM',
};

export const createFakeBlog = (blog?: BlogInputDto) => {
  let newBlog = testBlogData;

  if (blog) {
    newBlog = {
      ...blog,
    };
  }

  return newBlog;
};
