import { Schema, model } from 'mongoose';

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'admin'], default: 'buyer' },
  },
  { timestamps: true, versionKey: false },
);

export const UsersCollection = model('user', usersSchema);
