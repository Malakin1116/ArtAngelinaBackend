import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true }, // Сума платежу
  description: { type: String, required: true }, // Опис платежу
  paymentTime: { type: Date, required: true }, // Час оплати
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  transactionId: { type: String, required: true, unique: true }, // ID транзакції
  createdAt: { type: Date, default: Date.now },
});

export const Payment = mongoose.model('Payment', paymentSchema);
