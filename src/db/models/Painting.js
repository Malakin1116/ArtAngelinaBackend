import { Schema, model } from 'mongoose';

const paintingSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    image: { type: String, required: true }, // URL на зображення картини
    available: { type: Boolean, default: true }, // В наявності чи продана
  },
  { timestamps: true, versionKey: false },
);

export const PaintingCollection = model('painting', paintingSchema);
