import { ObjectId } from 'mongodb';

export type Comment = {
  content: string;
  commentatorInfo: {
    userId: ObjectId;
    userLogin: string;
  };
  postId: ObjectId;
  createdAt: Date;
};
