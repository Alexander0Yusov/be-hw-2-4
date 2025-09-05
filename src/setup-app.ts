import express, { Express } from 'express';
import cors from 'cors';
import { AUTH_PATH, BLOGS_PATH, paths, POSTS_PATH, TESTING_PATH, USERS_PATH } from './core/paths/paths';
import { blogsRouter } from './1-blogs/router/blogs.router';
import { postsRouter } from './2-posts/router/posts.router';
import { testRouter } from './3-testing/router/tests.router';
import { usersRouter } from './4-users/router/users.router';
import { setupSwagger } from './core/swagger/setup-swagger';
import { authRouter } from './5-auth/router/auth.router';
import { commentsRouter } from './6-comments/router/comments.router';

export const setupApp = (app: Express) => {
  app.use(express.json());
  app.use(cors());

  app.get('/', (req, res) => {
    res.status(200).send('Hello world!');
  });

  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(USERS_PATH, usersRouter);
  app.use(AUTH_PATH, authRouter);
  app.use(paths.comments, commentsRouter);
  app.use(TESTING_PATH, testRouter);

  setupSwagger(app);

  return app;
};
