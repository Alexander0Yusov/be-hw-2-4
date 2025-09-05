import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { AUTH_PATH, USERS_PATH } from '../../../core/paths/paths';
import { generateBasicAuthToken } from '../../utils/generateBasicAuthToken';
import { db } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { createFakeUser } from '../../utils/users/create-fake-user';

describe('Auth API', () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL);
    await db.drop();
  });

  afterAll(async () => {
    await db.drop();
    await db.stop();
  });

  it('should return status code 204; POST /auth/login', async () => {
    const newUser = createFakeUser('');

    await request(app)
      .post(USERS_PATH)
      .set('Authorization', generateBasicAuthToken())
      .send(newUser)
      .expect(HttpStatus.Created);

    await request(app)
      .post(AUTH_PATH + '/login')
      .send({ loginOrEmail: newUser.email, password: newUser.password })
      .expect(HttpStatus.Ok);
  });

  it('should return status code 400; POST /auth/registration', async () => {
    const newUser = createFakeUser('1');

    await request(app)
      .post(AUTH_PATH + '/registration')
      .send({ login: newUser.login, email: newUser.email, password: newUser.password })
      .expect(HttpStatus.NoContent);

    await request(app)
      .post(AUTH_PATH + '/registration')
      .send({ login: newUser.login, email: newUser.email, password: newUser.password })
      .expect(HttpStatus.BadRequest);
  });

  it('should send email with new code if user exists but not confirmed yet; status 204; POST /auth/registration-email-resending', async () => {
    const newUser = { login: 'yusovsky2', email: 'yusovsky2@gmail.com', password: 'qwerty123' };

    await request(app)
      .post(AUTH_PATH + '/registration')
      .send({ login: newUser.login, email: newUser.email, password: newUser.password })
      .expect(HttpStatus.NoContent);

    await request(app)
      .post(AUTH_PATH + '/registration-email-resending')
      .send({ email: newUser.email })
      .expect(HttpStatus.NoContent);
  });

  it('should confirm registration by email; status 204; POST auth/registration-confirmation', async () => {
    const user = await db.getCollections().userCollection.findOne({ 'accountData.email': 'yusovsky2@gmail.com' });

    await request(app)
      .post(AUTH_PATH + '/registration-confirmation')
      .send({ code: user?.emailConfirmation.confirmationCode })
      .expect(HttpStatus.NoContent);

    const updatedUser = await db
      .getCollections()
      .userCollection.findOne({ 'accountData.email': 'yusovsky2@gmail.com' });

    expect(updatedUser?.emailConfirmation.isConfirmed).toBeTruthy;
  });

  it('should return error if email already confirmed; status 400; POST auth/registration-email-resending', async () => {
    await request(app)
      .post(AUTH_PATH + '/registration-email-resending')
      .send({ email: 'yusovsky2@gmail.com' })
      .expect(HttpStatus.BadRequest);
  });
});
