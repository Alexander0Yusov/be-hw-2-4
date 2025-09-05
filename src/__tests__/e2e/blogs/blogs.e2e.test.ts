import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { createFakeBlog } from '../../utils/blogs/create-fake-blog';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { BLOGS_PATH, TESTING_PATH } from '../../../core/paths/paths';
import { generateBasicAuthToken } from '../../utils/generateBasicAuthToken';
import { BlogInputDto } from '../../../1-blogs/dto/blog-input.dto';
import { db } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';

describe('Blog API', () => {
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

  it('should create blog; POST blogs', async () => {
    await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);
  });

  it('should return blogs list; GET /blogs', async () => {
    await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);
    await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    const blogListResponse = await request(app).get(BLOGS_PATH).expect(HttpStatus.Ok);

    expect(blogListResponse.body.items).toBeInstanceOf(Array);
    expect(blogListResponse.body.items.length).toBeGreaterThanOrEqual(2);
  });

  it('should return blog by id; GET /blogs/:id', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(BLOGS_PATH + '/' + `${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual(createResponse.body);
  });

  it('should update blog; PUT /blogs/:id', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    const blogUpdateData: BlogInputDto = {
      name: 'some text',
      description: 'some description',
      websiteUrl: 'https://www.youtube.com/watch?v=DqM2',
    };

    await request(app)
      .put(BLOGS_PATH + '/' + `${createResponse.body.id}`)
      .set('Authorization', generateBasicAuthToken())
      .send(blogUpdateData)
      .expect(HttpStatus.NoContent);

    const response = await request(app).get(BLOGS_PATH + '/' + `${createResponse.body.id}`);

    expect(response.body).toEqual({
      ...createResponse.body,
      ...blogUpdateData,
    });
  });

  it('DELETE /blogs/:id and check after NOT FOUND', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    await request(app)
      .delete(BLOGS_PATH + '/' + `${createResponse.body.id}`)
      .set('Authorization', generateBasicAuthToken())
      .expect(HttpStatus.NoContent);

    const blogResponse = await request(app).get(BLOGS_PATH + '/' + `${createResponse.body.id}`);

    expect(blogResponse.status).toBe(HttpStatus.NotFound);
  });

  // addition
  it('should create post; POST /blogs/:blogId/posts', async () => {
    const createdBlog = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    await request(app)
      .post(BLOGS_PATH + '/' + `${createdBlog.body.id}` + '/posts')
      .set('Authorization', generateBasicAuthToken())
      .send({
        title: 'fake title',
        shortDescription: 'fake description',
        content: 'fake content',
      })
      .expect(HttpStatus.Created);
  });

  it('should get posts; GET /blogs/:blogId/posts', async () => {
    const createdBlog = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    await request(app)
      .post(BLOGS_PATH + '/' + `${createdBlog.body.id}` + '/posts')
      .set('Authorization', generateBasicAuthToken())
      .send({
        title: 'fake title',
        shortDescription: 'fake description',
        content: 'fake content',
      })
      .expect(HttpStatus.Created);
    await request(app)
      .post(BLOGS_PATH + '/' + `${createdBlog.body.id}` + '/posts')
      .set('Authorization', generateBasicAuthToken())
      .send({
        title: 'fake title 2',
        shortDescription: 'fake description 2',
        content: 'fake content 2',
      })
      .expect(HttpStatus.Created);

    const postListResponse = await request(app)
      .get(BLOGS_PATH + '/' + `${createdBlog.body.id}` + '/posts')
      .expect(HttpStatus.Ok);

    expect(postListResponse.body.items).toBeInstanceOf(Array);
    expect(postListResponse.body.items.length).toBeGreaterThanOrEqual(2);
  });
});
