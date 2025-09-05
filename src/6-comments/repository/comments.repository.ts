import { ObjectId } from 'mongodb';
import { Comment } from '../types/comment';
import { db } from '../../db/mongo.db';
import { CommentViewModel } from '../types/comment-view-model';
import { CommentQueryInput } from '../router/input/blog-query.input';
import { CommentInputDto } from '../dto/comment-input.dto';
import { CommentListPaginatedOutput } from '../router/output/comment-list-paginated.output';

export const commentsRepository = {
  async findManyByPostId(id: string, queryDto: CommentQueryInput): Promise<CommentListPaginatedOutput> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    filter.postId = new ObjectId(id);

    const items = await db
      .getCollections()
      .commentCollection.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await db.getCollections().commentCollection.countDocuments(filter);

    const res = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map(({ _id, content, commentatorInfo, createdAt }) => ({
        id: _id.toString(),
        content,
        commentatorInfo: {
          userId: commentatorInfo.userId.toString(),
          userLogin: commentatorInfo.userLogin,
        },
        createdAt,
      })),
    };

    return res;
  },

  async findById(id: string): Promise<CommentViewModel | null> {
    const foundComment = await db.getCollections().commentCollection.findOne({ _id: new ObjectId(id) });

    if (!foundComment) {
      return null;
    }

    return {
      id: foundComment._id.toString(),
      content: foundComment.content,
      commentatorInfo: {
        userId: foundComment.commentatorInfo.userId.toString(),
        userLogin: foundComment.commentatorInfo.userLogin,
      },
      createdAt: foundComment.createdAt,
    };
  },

  async create(comment: Comment): Promise<CommentViewModel> {
    const insertedResult = await db.getCollections().commentCollection.insertOne(comment);

    return {
      id: insertedResult.insertedId.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId.toString(),
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
    };
  },

  async update(id: string, dto: CommentInputDto): Promise<void> {
    const updateResult = await db.getCollections().commentCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          content: dto.content,
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Comment not exist');
    }

    return;
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await db.getCollections().commentCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Comment not exist');
    }
  },
};
