import { ObjectId, WithId } from 'mongodb';
import { PostInputDto } from '../dto/post-input.dto';
import { Post } from '../types/post';
import { db } from '../../db/mongo.db';
import { PostQueryInput } from '../router/input/blog-query.input';

export const postsRepository = {
  async findMany(queryDto: PostQueryInput): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    const items = await db
      .getCollections()
      .postCollection.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await db.getCollections().postCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async findManyById(id: string, queryDto: PostQueryInput): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      // searchNameTerm
    } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    // if (searchNameTerm) {
    //   filter.name = { $regex: searchNameTerm, $options: 'i' };
    // }

    filter.blogId = new ObjectId(id);

    const items = await db
      .getCollections()
      .postCollection.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await db.getCollections().postCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async findById(id: string): Promise<WithId<Post> | null> {
    return db.getCollections().postCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(post: Post): Promise<WithId<Post>> {
    const insertedResult = await db.getCollections().postCollection.insertOne(post);

    return { ...post, _id: insertedResult.insertedId };
  },

  async update(id: string, dto: PostInputDto, blogName: string): Promise<void> {
    const updateResult = await db.getCollections().postCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: new ObjectId(dto.blogId),
          blogName,
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Post not exist');
    }

    return;
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await db.getCollections().postCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Blog not exist');
    }
  },
};
