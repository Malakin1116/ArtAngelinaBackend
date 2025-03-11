import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { getEnvVar } from '../utils/getEnvVar.js';

import { Payment } from '../db/models/Payment.js'; // ✅ Виправлений імпорт

const paymentRouter = express.Router();

const MONO_API_URL = 'https://api.monobank.ua';
const MONO_TOKEN = getEnvVar('MONO_TOKEN');

paymentRouter.post('/set-webhook', async (req, res) => {
  try {
    const { webHookUrl } = req.body;
    const defaultWebHookUrl =
      'https://artangelinabackend.onrender.com/payment/webhook';
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
  res.status(200).send();
});

// ✅ Обробка подій WebHook від Monobank (без Order)
paymentRouter.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type !== 'StatementItem') {
      return res.status(400).json({ message: 'Непідтримуваний тип події' });
    }

    const { statementItem } = data;
    const { id: transactionId, description, amount, time } = statementItem;

    // ✅ Зберігаємо платіж у базу (без перевірки Order)
    const payment = new Payment({
      amount: amount / 100, // Сума в гривнях
      description, // Опис платежу
      paymentTime: new Date(time * 1000), // Час у форматі Date
      transactionId, // ID транзакції
      status: 'completed',
    });

    await payment.save();

    // ✅ Відповідаємо 200, щоб Monobank не надсилав повторні запити
    res.status(200).send();
  } catch (error) {
    console.error(
      '❌ Помилка налаштування WebHook:',
      error.response?.data ?? error.message ?? error,
    );
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

paymentRouter.get('/statement/:account/:from/:to?', async (req, res) => {
  try {
    const { account, from, to } = req.params;
    const endTime = to || Math.floor(Date.now() / 1000); // Якщо `to` не вказано, беремо поточний час
    const startTime = parseInt(from, 10);
    if (isNaN(startTime) || startTime < 0) {
      return res.status(400).json({ message: 'Невірний параметр from' });
    }
    if (endTime - startTime > 2682000) {
      return res
        .status(400)
        .json({ message: 'Період перевищує 31 добу + 1 годину' });
    }
    let allTransactions = [];
    let lastTransactionTime = endTime;
    do {
      const url = `${MONO_API_URL}/personal/statement/${account}/${startTime}/${lastTransactionTime}`;
      const response = await axios.get(url, {
        headers: { 'X-Token': MONO_TOKEN },
      });
      const transactions = response.data;
      allTransactions = allTransactions.concat(transactions);
      if (transactions.length < 500) {
        break; // ✅ Вихід, якщо отримано менше 500 записів
      }
      lastTransactionTime = transactions[transactions.length - 1].time; // ✅ Оновлюємо `to` для наступного запиту
    } while (allTransactions.length % 500 === 0); // ✅ Повторюємо, якщо отримано 500 записів
    res.json({
      transactions: allTransactions,
      hasMore: allTransactions.length >= 500,
      lastTransactionTime: lastTransactionTime || null,
    });
  } catch (error) {
    console.error(
      '❌ Помилка отримання виписки:',
      error.response?.data ?? error.message ?? error,
    );
    if (error.response?.status === 429) {
      return res
        .status(429)
        .json({ message: 'Занадто багато запитів, спробуйте через 60 секунд' });
    }
    res.status(500).json({ message: 'Помилка отримання виписки' });
  }
});

export default paymentRouter;
