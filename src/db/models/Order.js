import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: false }, // Змінюємо на необов’язкове
    paintings: [
      {
        paintingId: {
          type: Schema.Types.ObjectId,
          ref: 'painting',
          required: true,
        },
      },
    ],
    merch: [
      {
        merchId: {
          type: Schema.Types.ObjectId,
          ref: 'merch',
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
    paymentDescription: { type: String, required: false }, // Змінюємо на необов’язкове
    shippingDetails: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      novaPoshtaBranch: { type: String, required: true },
    },
  },
  { timestamps: true, versionKey: false },
);

export const OrderCollection = model('order', orderSchema);