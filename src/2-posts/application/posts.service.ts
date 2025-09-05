import { ObjectId, WithId } from 'mongodb';
import { postsRepository } from '../repository/posts.repository';
import { Post } from '../types/post';
import { PostQueryInput } from '../router/input/blog-query.input';
import { PostInputDto } from '../dto/post-input.dto';

export const postsService = {
  async findMany(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return postsRepository.findMany(queryDto);
  },

  async findManyById(
    id: string,
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return postsRepository.findManyById(id, queryDto);
  },

  async create(
    dto: PostInputDto,
    blogId: string,
    blogName: string,
  ): Promise<WithId<Post>> {
    const newPost: Post = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new ObjectId(blogId),
      blogName,
      createdAt: new Date(),
    };

    return postsRepository.create(newPost);
  },

  async findById(id: string): Promise<WithId<Post> | null> {
    return postsRepository.findById(id);
  },

  async update(id: string, dto: PostInputDto, blogName: string): Promise<void> {
    await postsRepository.update(id, dto, blogName);
    return;
  },

  async delete(id: string): Promise<void> {
    await postsRepository.delete(id);
    return;
  },
};
