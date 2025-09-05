import { PostInputDto } from '../../../2-posts/dto/post-input.dto';

const testPostData: PostInputDto = {
  title: 'fake title',
  shortDescription: 'fake description',
  content: 'fake content',
  blogId: 'fakeid',
};

export const createFakePost = (
  data?:
    | string
    | {
        title: string;
        shortDescription: string;
        content: string;
        blogId: string;
      },
) => {
  if (typeof data === 'string') {
    return {
      ...testPostData,
      blogId: data,
    };
  }

  return {
    ...testPostData,
    ...data,
  };
};
