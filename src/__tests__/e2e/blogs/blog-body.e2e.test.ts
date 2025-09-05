import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { createFakeBlog } from '../../utils/blogs/create-fake-blog';
import { BLOGS_PATH, TESTING_PATH } from '../../../core/paths/paths';
import { generateBasicAuthToken } from '../../utils/generateBasicAuthToken';
import { db } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';

describe('Blog API body validation check', () => {
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

  it(`❌ should not create blog when incorrect body passed; POST /api/blogs`, async () => {
    await request(app).post(BLOGS_PATH).send(createFakeBlog()).expect(HttpStatus.Unauthorized);

    const invalidDataSet1 = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(
        createFakeBlog({
          name: '     ', // empty string
          description: '    ', // empty string
          websiteUrl: '    ', // empty string + invalid format
        }),
      )
      .expect(HttpStatus.BadRequest);
    expect(invalidDataSet1.body.errorsMessages).toHaveLength(3);

    const invalidDataSet2 = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(
        createFakeBlog({
          name: '0'.repeat(16), // more than max symbols
          description: '0'.repeat(501), // more than max symbols
          websiteUrl: 'http://localhost:5001/api/blogs2' + '0'.repeat(101), // incorrect url + more than max symbols
        }),
      )
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet2.body.errorsMessages).toHaveLength(3);

    const invalidDataSet3 = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(
        createFakeBlog({
          // @ts-ignore
          name: 123, // incorrect type
          // @ts-ignore
          description: 123, // incorrect type
          // @ts-ignore
          websiteUrl: 123, // incorrect url + incorrect type
        }),
      )
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet3.body.errorsMessages).toHaveLength(3);

    // check что никто не создался
    const blogListResponse = await request(app).get(BLOGS_PATH).set('Authorization', generateBasicAuthToken());

    expect(blogListResponse.body.items).toHaveLength(0);
  });

  // добавка

  it(`❌ should not create post when incorrect /:blogId passed; POST /api/blogs/:blogId/posts`, async () => {
    const invalidDataSet1 = await request(app)
      .post(BLOGS_PATH + '/63189b06003380064c4193be' + '/posts')
      .set('Authorization', generateBasicAuthToken())
      .send({
        title: 'fake title',
        shortDescription: 'fake description',
        content: 'fake content',
      })
      .expect(HttpStatus.NotFound);

    expect(invalidDataSet1.body.errorsMessages).toHaveLength(1);

    // check что никто не создался
    const blogListResponse = await request(app).get(BLOGS_PATH).set('Authorization', generateBasicAuthToken());

    expect(blogListResponse.body.items).toHaveLength(0);
  });

  it(`❌ should not get response ✔ when incorrect /:blogId passed; GET /api/blogs/:blogId/posts`, async () => {
    await request(app)
      .get(BLOGS_PATH + '/63189b06003380064c4193be' + '/posts')
      .expect(HttpStatus.NotFound);
  });
});
