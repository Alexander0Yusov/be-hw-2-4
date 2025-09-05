export const BLOGS_PATH = '/blogs';
export const POSTS_PATH = '/posts';
export const USERS_PATH = '/users';
export const AUTH_PATH = '/auth';
export const COMMENTS_PATH = '/comments';

export const TESTING_PATH = '/testing';

export const paths = {
  home: '/',
  auth: {
    home: '/auth',
    login: '/auth/login',
    register: '/auth/register',
  },
  blogs: '/blogs',
  posts: '/posts',
  users: '/users',
  comments: '/comments',
  testing: '/testing',
} as const;
