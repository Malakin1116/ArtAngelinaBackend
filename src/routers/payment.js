import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { getEnvVar } from '../utils/getEnvVar.js';
import { OrderCollection } from '../db/models/Order.js';
import { Payment } from '../db/models/Payment.js'; // ✅ Виправлений імпорт

const paymentRouter = express.Router();

const MONO_API_URL = 'https://api.monobank.ua';
const MONO_TOKEN = getEnvVar('MONO_TOKEN');

paymentRouter.post('/set-webhook', async (req, res) => {
  try {
    const { webHookUrl } = req.body;
    const defaultWebHookUrl = 'https://твій_сайт.onrender.com/payment/webhook';
    const hookUrl = webHookUrl || defaultWebHookUrl;

    if (!hookUrl || typeof hookUrl !== 'string') {
      return res
        .status(400)
        .json({ message: 'Невірний або відсутній webHookUrl' });
    }

    const response = await axios.post(
      `${MONO_API_URL}/personal/webhook`,
      { webHookUrl: hookUrl },
      { headers: { 'X-Token': MONO_TOKEN } },
    );

    if (response.status === 200) {
      res.json({ message: 'WebHook успішно налаштовано', webHookUrl: hookUrl });
    } else {
      res.status(500).json({ message: 'Помилка налаштування WebHook' });
    }
  } catch (error) {
    console.error(
      'Помилка налаштування WebHook:',
      error.response?.data || error.message,
    );
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Обробка WebHook
paymentRouter.get('/webhook', (req, res) => {
  console.log('Monobank перевіряє WebHook');
  res.status(200).send(); // Відповідаємо тільки 200, як вимагає документація
});

// ✅ Обробка подій WebHook від Monobank
paymentRouter.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type !== 'StatementItem') {
      return res.status(400).json({ message: 'Непідтримуваний тип події' });
    }

    const { statementItem } = data;
    const { id: transactionId, description, amount, time } = statementItem;

    console.log(
      `💰 Отримано оплату: ${amount / 100} грн, опис: ${description}`,
    );

    // ✅ Шукаємо orderId у description
    const orderIdMatch = description.match(/Order-\d+/);
    if (!orderIdMatch) {
      console.warn(`⚠️ Не знайдено Order ID у: ${description}`);
      return res.status(400).json({ message: 'Неможливо знайти Order ID' });
    }

    const orderIdStr = orderIdMatch[0];
    const order = await OrderCollection.findOne({
      paymentDescription: orderIdStr,
    });

    if (!order) {
      console.warn(`❌ Замовлення ${orderIdStr} не знайдено`);
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    // ✅ Перевіряємо суму
    if (order.totalPrice * 100 !== amount) {
      console.warn(
        `⚠️ Невірна сума для ${orderIdStr}: очікувалось ${
          order.totalPrice
        }, отримано ${amount / 100}`,
      );
      return res.status(400).json({ message: 'Сума оплати не збігається' });
    }

    // ✅ Оновлюємо статус замовлення
    order.status = 'paid';
    await order.save();

    // ✅ Зберігаємо інформацію про платіж
    const payment = new Payment({
      orderId: order._id,
      amount: amount / 100,
      description: orderIdStr,
      items: order.paintings.map((p) => ({
        name: p.paintingId.name || 'Unknown',
        quantity: 1,
        price: order.totalPrice,
      })),
      paymentTime: new Date(time * 1000),
      transactionId,
      status: 'completed',
    });

    await payment.save();
    console.log(`✅ Оплата для замовлення ${orderIdStr} збережена!`);

    res.status(200).send(); // Відповідаємо 200, щоб Monobank не відправляв повторні запити
  } catch (error) {
    console.error('❌ Помилка обробки WebHook:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// // Створення замовлення
// paymentRouter.post('/create-order', async (req, res) => {
//   const { paintings } = req.body;
//   if (!paintings || !Array.isArray(paintings)) {
//     return res.status(400).json({ message: 'Невірний формат paintings' });
//   }

//   const totalPrice = paintings.length * 100;
//   const orderId = `Order-${Date.now()}`;
//   const paymentDescription = orderId;

//   const order = new OrderCollection({
//     // ✅ Виправлено
//     userId: req.user?.id || null,
//     paintings: paintings.map((paintingId) => ({ paintingId })),
//     totalPrice,
//     paymentDescription,
//   });

//   await order.save();
//   res.json({
//     orderId,
//     totalPrice,
//     cardNumber: '5375 1234 5678 9012',
//     instructions: `Перекажіть ${totalPrice} грн на картку з коментарем "${orderId}"`,
//   });
// });

export default paymentRouter;
