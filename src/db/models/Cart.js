import { Schema, model } from 'mongoose';

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    paintings: [
      {
        paintingId: {
          type: Schema.Types.ObjectId,
          ref: 'painting',
          required: true,
          unique: true,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

export const CartCollection = model('cart', cartSchema);
