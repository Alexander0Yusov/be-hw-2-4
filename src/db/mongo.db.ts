import { Collection, Db, MongoClient } from 'mongodb';

import { SETTINGS } from '../core/settings/settings';
import { Blog } from '../1-blogs/types/blog';
import { Post } from '../2-posts/types/post';
import { User } from '../4-users/types/user';
import { Comment } from '../6-comments/types/comment';

// export let client: MongoClient;
// export let blogCollection: Collection<Blog>;
// export let postCollection: Collection<Post>;
// export let userCollection: Collection<User>;
// export let commentCollection: Collection<Comment>;

// Подключения к бд
// export async function runDB(url: string): Promise<void> {
//   client = new MongoClient(url);
//   const db: Db = client.db(SETTINGS.DB_NAME);

//   // Инициализация коллекций
//   blogCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
//   postCollection = db.collection<Post>(POST_COLLECTION_NAME);
//   userCollection = db.collection<User>(USER_COLLECTION_NAME);
//   commentCollection = db.collection<Comment>(COMMENTS_COLLECTION_NAME);

//   try {
//     await client.connect();
//     await db.command({ ping: 1 });
//     console.log('✅ Connected to the database');
//   } catch (e) {
//     await client.close();
//     throw new Error(`❌ Database not connected: ${e}`);
//   }
// }

// для тестов
// export async function stopDB() {
//   if (!client) {
//     throw new Error(`❌ No active client`);
//   }
//   await client.close();
// }

// --------------------------
export const db = {
  client: {} as MongoClient,

  getDbName(): Db {
    return this.client.db(SETTINGS.DB_NAME);
  },

  async run(url: string) {
    try {
      this.client = new MongoClient(url);
      await this.client.connect();
      await this.getDbName().command({ ping: 1 });
      console.log('✅ Connected to the database');
    } catch (e: unknown) {
      console.error(`❌ Database not connected: ${e}`);
      await this.client.close();
    }
  },

  async stop() {
    await this.client.close();
    console.log('✅ Connection successful closed');
  },

  async drop() {
    try {
      //await this.getDbName().dropDatabase()
      const collections = await this.getDbName().listCollections().toArray();

      for (const collection of collections) {
        const collectionName = collection.name;
        await this.getDbName().collection(collectionName).deleteMany({});
      }
    } catch (e: unknown) {
      console.error('Error in drop db:', e);
      await this.stop();
    }
  },

  getCollections() {
    return {
      userCollection: this.getDbName().collection<User>('users'),
      blogCollection: this.getDbName().collection<Blog>('blogs'),
      postCollection: this.getDbName().collection<Post>('posts'),
      commentCollection: this.getDbName().collection<Comment>('comments'),
    };
  },
};
