import { WithId } from 'mongodb';
import { Blog } from '../types/blog';
import { blogsRepository } from '../repository/blogs.repository';
import { BlogQueryInput } from '../router/input/blog-query.input';
import { BlogInputDto } from '../dto/blog-input.dto';

export const blogsService = {
  async findMany(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    return blogsRepository.findMany(queryDto);
  },

  async create(dto: BlogInputDto): Promise<WithId<Blog>> {
    const newBlog: Blog = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };

    return blogsRepository.create(newBlog);
  },

  async findByIdOrFail(id: string): Promise<WithId<Blog>> {
    return blogsRepository.findByIdOrFail(id);
  },

  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsRepository.findById(id);
  },

  async update(id: string, dto: BlogInputDto): Promise<void> {
    await blogsRepository.update(id, dto);
    return;
  },

  async delete(id: string): Promise<void> {
    await blogsRepository.delete(id);
    return;
  },
};
