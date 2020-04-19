import mongoose from 'mongoose';
import { schemaComposer } from 'graphql-compose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'users',
  },
);

export const UserModel = mongoose.model('UserModel', userSchema);

const UserTC = composeWithMongoose(UserModel, {});
// Queries
schemaComposer.Query.addFields({
  userById: UserTC.getResolver('findById'),
  userOne: UserTC.getResolver('findOne'),
  userCount: UserTC.getResolver('count'),
});
// Mutations
schemaComposer.Mutation.addFields({
  userCreateOne: UserTC.getResolver('createOne'),
  userUpdateById: UserTC.getResolver('updateById'),
  userUpdateOne: UserTC.getResolver('updateOne'),
  userRemoveById: UserTC.getResolver('removeById'),
  userRemoveOne: UserTC.getResolver('removeOne'),
});

export const schema = schemaComposer.buildSchema();
export default UserModel;
