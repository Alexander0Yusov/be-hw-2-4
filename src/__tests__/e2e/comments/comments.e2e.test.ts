import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { AUTH_PATH, BLOGS_PATH, COMMENTS_PATH, POSTS_PATH, TESTING_PATH, USERS_PATH } from '../../../core/paths/paths';
import { generateBasicAuthToken } from '../../utils/generateBasicAuthToken';
import { createFakePost } from '../../utils/posts/create-fake-post';
import { db } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { createFakeBlog } from '../../utils/blogs/create-fake-blog';
import { createFakeUser } from '../../utils/users/create-fake-user';

describe('Comment API', () => {
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

  it('should create comment; POST comments', async () => {
    // создание блога -> поста
    const createdBlog = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeBlog())
      .expect(HttpStatus.Created);

    const createdPost = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakePost(createdBlog.body.id))
      .expect(HttpStatus.Created);

    // создание пользователя
    const newUser = createFakeUser('1');

    await request(app)
      .post(USERS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(newUser)
      .expect(HttpStatus.Created);

    const loginResponse = await request(app)
      .post(AUTH_PATH + '/login')
      .send({ loginOrEmail: newUser.email, password: newUser.password })
      .expect(HttpStatus.Ok);

    // создание комментария
    const createdComment = await request(app)
      .post(POSTS_PATH + `/${createdPost.body.id}` + '/comments')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({ content: 'a'.repeat(25) })
      .expect(HttpStatus.Created);

    const res = await request(app)
      .get(COMMENTS_PATH + `/${createdComment.body.id}`)
      .expect(HttpStatus.Ok);

    // получение всех комментариев к посту
    const comments = await request(app)
      .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments')
      .expect(HttpStatus.Ok);

    // редактирование комментария
    await request(app)
      .put(COMMENTS_PATH + `/${createdComment.body.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({ content: 'b'.repeat(25) })
      .expect(HttpStatus.NoContent);

    const res2 = await request(app)
      .get(COMMENTS_PATH + `/${createdComment.body.id}`)
      .expect(HttpStatus.Ok);

    // удаление комментария
    await request(app)
      .del(COMMENTS_PATH + `/${createdComment.body.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(HttpStatus.NoContent);

    const res3 = await request(app)
      .get(COMMENTS_PATH + `/${createdComment.body.id}`)
      .expect(HttpStatus.NotFound);
  });

  // it('should return posts list; GET /posts', async () => {
  //   const createdBlog = await request(app)
  //     .post(BLOGS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakeBlog())
  //     .expect(HttpStatus.Created);

  //   await request(app)
  //     .post(POSTS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakePost(createdBlog.body.id))
  //     .expect(HttpStatus.Created);
  //   await request(app)
  //     .post(POSTS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakePost(createdBlog.body.id))
  //     .expect(HttpStatus.Created);

  //   const postListResponse = await request(app)
  //     .get(POSTS_PATH)
  //     .expect(HttpStatus.Ok);

  //   expect(postListResponse.body.items).toBeInstanceOf(Array);
  //   expect(postListResponse.body.items.length).toBeGreaterThanOrEqual(2);
  // });

  // it('should return post by id; GET /posts/:id', async () => {
  //   const createdBlog = await request(app)
  //     .post(BLOGS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakeBlog())
  //     .expect(HttpStatus.Created);

  //   const createResponse = await request(app)
  //     .post(POSTS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakePost(createdBlog.body.id))
  //     .expect(HttpStatus.Created);

  //   const getResponse = await request(app)
  //     .get(POSTS_PATH + '/' + `${createResponse.body.id}`)
  //     .expect(HttpStatus.Ok);

  //   expect(getResponse.body).toEqual(createResponse.body);
  // });

  // it('should update post; PUT /posts/:id', async () => {
  //   const createdBlog_1 = await request(app)
  //     .post(BLOGS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakeBlog())
  //     .expect(HttpStatus.Created);

  //   const createdBlog_2 = await request(app)
  //     .post(BLOGS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakeBlog())
  //     .expect(HttpStatus.Created);

  //   const createdPost = await request(app)
  //     .post(POSTS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakePost(createdBlog_1.body.id))
  //     .expect(HttpStatus.Created);

  //   const postUpdateData: PostInputDto = {
  //     title: 'text. after put req',
  //     shortDescription: 'description. after put req',
  //     content: 'content. after put req',
  //     blogId: createdBlog_2.body.id,
  //   };

  //   await request(app)
  //     .put(POSTS_PATH + '/' + `${createdPost.body.id}`)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(postUpdateData)
  //     .expect(HttpStatus.NoContent);

  //   const response = await request(app).get(
  //     POSTS_PATH + '/' + `${createdPost.body.id}`,
  //   );

  //   expect(response.body).toEqual({
  //     ...createdPost.body,
  //     ...postUpdateData,
  //   });
  // });

  // it('DELETE /posts/:id and check after NOT FOUND', async () => {
  //   const createdBlog = await request(app)
  //     .post(BLOGS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakeBlog())
  //     .expect(HttpStatus.Created);

  //   const createResponse = await request(app)
  //     .post(POSTS_PATH)
  //     .set('Authorization', generateBasicAuthToken())
  //     .send(createFakePost(createdBlog.body.id))
  //     .expect(HttpStatus.Created);

  //   await request(app)
  //     .delete(POSTS_PATH + '/' + `${createResponse.body.id}`)
  //     .set('Authorization', generateBasicAuthToken())
  //     .expect(HttpStatus.NoContent);

  //   const response = await request(app).get(
  //     POSTS_PATH + '/' + `${createResponse.body.id}`,
  //   );

  //   expect(response.status).toBe(HttpStatus.NotFound);
  // });
});
