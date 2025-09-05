import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { BLOGS_PATH, POSTS_PATH, TESTING_PATH } from '../../../core/paths/paths';
import { generateBasicAuthToken } from '../../utils/generateBasicAuthToken';
import { createFakePost } from '../../utils/posts/create-fake-post';
import { PostInputDto } from '../../../2-posts/dto/post-input.dto';
import { db } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { createFakeBlog } from '../../utils/blogs/create-fake-blog';

describe('Post API', () => {
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
  it('should create post; POST posts', async () => {
    const createdBlog = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakePost(createdBlog.body.id))
      .expect(HttpStatus.Created);
  });

  it('should return posts list; GET /posts', async () => {
    const createdBlog = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakePost(createdBlog.body.id))
      .expect(HttpStatus.Created);
    await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakePost(createdBlog.body.id))
      .expect(HttpStatus.Created);

    const postListResponse = await request(app).get(POSTS_PATH).expect(HttpStatus.Ok);

    expect(postListResponse.body.items).toBeInstanceOf(Array);
    expect(postListResponse.body.items.length).toBeGreaterThanOrEqual(2);
  });

  it('should return post by id; GET /posts/:id', async () => {
    const createdBlog = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    const createResponse = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakePost(createdBlog.body.id))
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(POSTS_PATH + '/' + `${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual(createResponse.body);
  });

  it('should update post; PUT /posts/:id', async () => {
    const createdBlog_1 = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    const createdBlog_2 = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    const createdPost = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakePost(createdBlog_1.body.id))
      .expect(HttpStatus.Created);

    const postUpdateData: PostInputDto = {
      title: 'text. after put req',
      shortDescription: 'description. after put req',
      content: 'content. after put req',
      blogId: createdBlog_2.body.id,
    };

    await request(app)
      .put(POSTS_PATH + '/' + `${createdPost.body.id}`)
      .set('Authorization', generateBasicAuthToken())
      .send(postUpdateData)
      .expect(HttpStatus.NoContent);

    const response = await request(app).get(POSTS_PATH + '/' + `${createdPost.body.id}`);

    expect(response.body).toEqual({
      ...createdPost.body,
      ...postUpdateData,
    });
  });

  it('DELETE /posts/:id and check after NOT FOUND', async () => {
    const createdBlog = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    const createResponse = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakePost(createdBlog.body.id))
      .expect(HttpStatus.Created);

    await request(app)
      .delete(POSTS_PATH + '/' + `${createResponse.body.id}`)
      .set('Authorization', generateBasicAuthToken())
      .expect(HttpStatus.NoContent);

    const response = await request(app).get(POSTS_PATH + '/' + `${createResponse.body.id}`);

    expect(response.status).toBe(HttpStatus.NotFound);
  });
});
