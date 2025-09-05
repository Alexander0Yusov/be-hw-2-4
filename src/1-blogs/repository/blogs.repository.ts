import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { db } from '../../db/mongo.db';
import { BlogInputDto } from '../dto/blog-input.dto';
import { BlogQueryInput } from '../router/input/blog-query.input';
import { Blog } from '../types/blog';
import { ObjectId, WithId } from 'mongodb';

export const blogsRepository = {
  async findMany(queryDto: BlogQueryInput): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const items = await db
      .getCollections()
      .blogCollection.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await db.getCollections().blogCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async findById(id: string): Promise<WithId<Blog> | null> {
    return db.getCollections().blogCollection.findOne({ _id: new ObjectId(id) });
  },

  async findByIdOrFail(id: string): Promise<WithId<Blog>> {
    const res = await db.getCollections().blogCollection.findOne({ _id: new ObjectId(id) });

    if (!res) {
      throw new RepositoryNotFoundError('Blog not exist');
    }

    return res;
  },

  async create(blog: Blog): Promise<WithId<Blog>> {
    const insertedResult = await db.getCollections().blogCollection.insertOne(blog);
    return { ...blog, _id: insertedResult.insertedId };
  },

  async update(id: string, dto: BlogInputDto): Promise<void> {
    const updateResult = await db.getCollections().blogCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Blog not exist');
    }

    return;
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await db.getCollections().blogCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Blog not exist');
    }
  },
};
