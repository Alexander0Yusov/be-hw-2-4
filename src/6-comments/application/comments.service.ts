import { ObjectId } from 'mongodb';
import { commentsRepository } from '../repository/comments.repository';
import { Comment } from '../types/comment';
import { CommentInputDto } from '../dto/comment-input.dto';
import { CommentViewModel } from '../types/comment-view-model';
import { CommentQueryInput } from '../router/input/blog-query.input';
import { CommentListPaginatedOutput } from '../router/output/comment-list-paginated.output';

export const commentsService = {
  async findManyByPostId(id: string, queryDto: CommentQueryInput): Promise<CommentListPaginatedOutput> {
    return commentsRepository.findManyByPostId(id, queryDto);
  },

  async create(dto: CommentInputDto, userId: string, userLogin: string, postId: ObjectId): Promise<CommentViewModel> {
    const newComment: Comment = {
      content: dto.content,
      commentatorInfo: {
        userId: new ObjectId(userId),
        userLogin,
      },
      postId: postId,
      createdAt: new Date(),
    };

    return commentsRepository.create(newComment);
  },

  async findById(id: string): Promise<CommentViewModel | null> {
    return commentsRepository.findById(id);
  },

  async update(id: string, dto: CommentInputDto): Promise<void> {
    await commentsRepository.update(id, dto);
    return;
  },

  async delete(id: string): Promise<void> {
    await commentsRepository.delete(id);
    return;
  },
};
