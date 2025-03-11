import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order', // ✅ Виправлене ref
    required: true,
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true },
    },
  ],
  paymentTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  transactionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Payment = mongoose.model('Payment', paymentSchema);
