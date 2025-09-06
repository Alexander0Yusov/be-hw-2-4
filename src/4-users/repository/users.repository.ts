import { User } from '../types/user';
import { db } from '../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { RefreshTokenData } from '../../5-auth/types/refresh-token';

export const usersRepository = {
  async findById(id: string): Promise<WithId<User> | null> {
    const user = await db.getCollections().userCollection.findOne({
      _id: new ObjectId(id),
    });

    return user;
  },

  async findByCode(code: string): Promise<WithId<User> | null> {
    const user = await db.getCollections().userCollection.findOne({ 'emailConfirmation.confirmationCode': code });

    if (user) {
      return user;
    }

    return null;
  },

  async findByEmailOrLogin(loginOrEmail: string): Promise<WithId<User> | null> {
    const user = await db.getCollections().userCollection.findOne({
      $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
    });

    if (user) {
      return user;
    }

    return null;
  },

  async create(user: User): Promise<string> {
    const insertedResult = await db.getCollections().userCollection.insertOne(user);

    return insertedResult.insertedId.toString();
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await db.getCollections().userCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Blog not exist');
    }
  },

  async confirmEmail(code: string): Promise<string | null> {
    const user = await db
      .getCollections()
      .userCollection.findOneAndUpdate(
        { 'emailConfirmation.confirmationCode': code },
        { $set: { 'emailConfirmation.isConfirmed': true } },
      );

    return user?._id.toString() || null;
  },

  async prolongationConfirmationCode(email: string, newCode: string, newExpiration: Date): Promise<string | null> {
    const user = await db.getCollections().userCollection.findOneAndUpdate(
      { 'accountData.email': email },
      {
        $set: {
          'emailConfirmation.confirmationCode': newCode,
          'emailConfirmation.expirationDate': newExpiration,
        },
      },
    );

    return user?._id.toString() || null;
  },

  async setRefreshTokenById(id: ObjectId, refreshTokenData: RefreshTokenData): Promise<true> {
    await db.getCollections().userCollection.updateOne({ _id: id }, { $push: { refreshTokens: refreshTokenData } });

    return true;
  },

  //
  async findByRefreshToken(refreshToken: string): Promise<WithId<User> | null> {
    const user = await db.getCollections().userCollection.findOne({ 'refreshTokens.value': refreshToken });

    return user;
  },

  async setStatusIsRevokedForRefreshToken(refreshToken: string): Promise<boolean> {
    const res = await db
      .getCollections()
      .userCollection.updateOne(
        { 'refreshTokens.value': refreshToken },
        { $set: { 'refreshTokens.$.isRevoked': true } },
      );

    return res.acknowledged;
  },
};
