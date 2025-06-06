import { Schema, model } from 'mongoose';

const merchSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const MerchCollection = model('merch', merchSchema);