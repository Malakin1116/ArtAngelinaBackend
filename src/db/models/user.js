import { model, Schema } from 'mongoose';
import { emailRegexp } from '../../constants/index.js';

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      match: emailRegexp,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
  },

  { timestamps: true, versionKey: false },
);

export const UsersCollection = model('users', usersSchema);
