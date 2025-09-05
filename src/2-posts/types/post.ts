import { ObjectId } from 'mongodb';

export type Post = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt: Date;
};
