import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { BLOGS_PATH, POSTS_PATH, TESTING_PATH } from '../../../core/paths/paths';
import { generateBasicAuthToken } from '../../utils/generateBasicAuthToken';
import { createFakePost } from '../../utils/posts/create-fake-post';
import { db } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { createFakeBlog } from '../../utils/blogs/create-fake-blog';

describe('Post API body validation check', () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL);
    await request(app)
      .delete(TESTING_PATH + '/all-data')
      .expect(HttpStatus.NoContent);
  });

  afterAll(async () => {
    await db.stop();
  });

  it(`❌ should not create post when incorrect body passed; POST /api/posts'`, async () => {
    const createdBlog = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    await request(app).post(POSTS_PATH).send(createFakePost(createdBlog.body.id)).expect(HttpStatus.Unauthorized);

    const invalidDataSet1 = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(
        createFakePost({
          title: '     ', // empty string
          shortDescription: '    ', // empty string
          content: '    ', // empty string
          blogId: '   ', // empty string
        }),
      )
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet1.body.errorsMessages).toHaveLength(4);

    const invalidDataSet2 = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(
        createFakePost({
          title: '0'.repeat(31), // more than max symbols
          shortDescription: '0'.repeat(101), // more than max symbols
          content: '0'.repeat(1001), // more than max symbols
          blogId: '123',
        }),
      )
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet2.body.errorsMessages).toHaveLength(3);

    const invalidDataSet3 = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(
        createFakePost({
          // @ts-ignore
          title: 123, // incorrect type
          // @ts-ignore
          shortDescription: 123, // incorrect type
          // @ts-ignore
          content: 123, // incorrect type
          // @ts-ignore
          blogId: 123, // incorrect type
        }),
      )
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet3.body.errorsMessages).toHaveLength(4);

    // check что никто не создался
    const postListResponse = await request(app).get(POSTS_PATH);
    expect(postListResponse.body.items).toHaveLength(0);
  });
});
