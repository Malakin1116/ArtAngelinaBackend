import { Schema, model } from 'mongoose';

const paymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'order',
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: ['direct', 'coinbase', 'manual'],
      default: 'direct',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'expired'],
      default: 'pending',
    },
    paymentUrl: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USDT',
    },
    transactionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

export const PaymentCollection = model('Payment', paymentSchema);