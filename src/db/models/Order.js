import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    paintings: [
      {
        paintingId: {
          type: Schema.Types.ObjectId,
          ref: 'painting',
          required: true,
        },
      },
    ],
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled',
        'paid',
      ],
      default: 'pending',
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },
    paymentDescription: { type: String, required: true }, // ✅ Додане поле
  },
  { timestamps: true, versionKey: false },
);

export const OrderCollection = model('order', orderSchema);
