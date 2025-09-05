import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { TESTING_PATH, USERS_PATH } from '../../../core/paths/paths';
import { generateBasicAuthToken } from '../../utils/generateBasicAuthToken';
import { db } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { createFakeUser } from '../../utils/users/create-fake-user';

describe('User API', () => {
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

  it('should create user; POST users', async () => {
    await request(app)
      .post(USERS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeUser('0'))
      .expect(HttpStatus.Created);
  });

  it('should return users list; GET /users', async () => {
    await request(app)
      .post(USERS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeUser('1'))
      .expect(HttpStatus.Created);
    await request(app)
      .post(USERS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeUser('2'))
      .expect(HttpStatus.Created);

    const userListResponse = await request(app)
      .get(
        USERS_PATH + '?pageSize=15&pageNumber=1&searchLoginTerm=keL&searchEmailTerm=ke&sortDirection=asc&sortBy=login',
      )
      .expect(HttpStatus.Ok);

    expect(userListResponse.body.items).toBeInstanceOf(Array);
    expect(userListResponse.body.items.length).toBeGreaterThanOrEqual(2);
  });

  it('DELETE /users/:id and check after NOT FOUND', async () => {
    const createResponse = await request(app)
      .post(USERS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(createFakeUser('3'))
      .expect(HttpStatus.Created);

    await request(app)
      .delete(USERS_PATH + '/' + `${createResponse.body.id}`)
      .set('Authorization', generateBasicAuthToken())
      .expect(HttpStatus.NoContent);

    const userResponse = await request(app).get(USERS_PATH + '/' + `${createResponse.body.id}`);

    expect(userResponse.status).toBe(HttpStatus.NotFound);
  });
});
