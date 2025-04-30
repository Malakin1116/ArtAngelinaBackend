import { CartCollection } from '../db/models/Cart.js';
import { PaintingCollection } from '../db/models/Painting.js';
import { MerchCollection } from '../db/models/merch.js';
import { OrderCollection } from '../db/models/Order.js';
import { PaymentCollection } from '../db/models/Payment.js';
import mongoose from 'mongoose';

const walletAddress = process.env.TRON_WALLET_ADDRESS || "your_tron_wallet_address"; // Заглушка для адреси

export const addToCart = async (req, res) => {
  try {
    const { paintingId } = req.body;
    const userId = req.user._id;

    const painting = await PaintingCollection.findById(paintingId);
    if (!painting) {
      return res.status(404).json({ message: 'Painting not found' });
    }

    if (!painting.available) {
      return res.status(400).json({ message: 'Painting is not available' });
    }

    let cart = await CartCollection.findOne({ userId });

    if (!cart) {
      cart = await CartCollection.create({
        userId,
        paintings: [{ paintingId }],
        merch: [],
      });
    } else {
      const paintingExists = cart.paintings.some(
        (item) => item.paintingId.toString() === paintingId,
      );

      if (paintingExists) {
        return res
          .status(400)
          .json({ message: 'Painting is already in your cart' });
      } else {
        cart.paintings.push({ paintingId });
        await cart.save();
      }
    }

    return res.status(200).json({ message: 'Painting added to cart', cart });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Painting is already in your cart' });
    }
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const addMerchToCart = async (req, res) => {
  try {
    const { merchId } = req.body;
    const userId = req.user._id;

    const merch = await MerchCollection.findById(merchId);
    if (!merch) {
      return res.status(404).json({ message: 'Merch item not found' });
    }

    if (!merch.available) {
      return res.status(400).json({ message: 'Merch item is not available' });
    }

    let cart = await CartCollection.findOne({ userId });

    if (!cart) {
      cart = await CartCollection.create({
        userId,
        paintings: [],
        merch: [{ merchId }],
      });
    } else {
      const merchExists = cart.merch.some(
        (item) => item.merchId.toString() === merchId,
      );

      if (merchExists) {
        return res
          .status(400)
          .json({ message: 'Merch item is already in your cart' });
      } else {
        cart.merch.push({ merchId });
        await cart.save();
      }
    }

    return res.status(200).json({ message: 'Merch item added to cart', cart });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Merch item is already in your cart' });
    }
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await CartCollection.findOne({ userId })
      .populate('paintings.paintingId')
      .populate('merch.merchId');

    if (!cart) {
      return res.status(200).json({
        message: 'Cart is empty',
        data: { paintings: [], merch: [] },
      });
    }

    return res.status(200).json({
      message: 'Cart retrieved successfully',
      data: cart,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { paintingId } = req.params;
    const userId = req.user._id;

    let cart = await CartCollection.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const paintingIndex = cart.paintings.findIndex(
      (item) => item.paintingId.toString() === paintingId,
    );
    const merchIndex = cart.merch.findIndex(
      (item) => item.merchId.toString() === paintingId,
    );

    if (paintingIndex === -1 && merchIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (paintingIndex !== -1) {
      await PaintingCollection.findByIdAndUpdate(paintingId, { available: true });
      cart.paintings.splice(paintingIndex, 1);
    } else if (merchIndex !== -1) {
      await MerchCollection.findByIdAndUpdate(paintingId, { available: true });
      cart.merch.splice(merchIndex, 1);
    }

    await cart.save();

    return res
      .status(200)
      .json({ message: 'Item removed from cart', cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const checkout = async (req, res) => {
  try {
    let paintings = [];
    let merch = [];
    let userId = null;

    // Перевіряємо, чи є shippingDetails у тілі запиту
    const { shippingDetails } = req.body;
    if (!shippingDetails || !shippingDetails.fullName || !shippingDetails.phoneNumber || !shippingDetails.novaPoshtaBranch) {
      return res.status(400).json({ message: 'Shipping details are required' });
    }

    // Встановлюємо paymentDescription за замовчуванням, якщо воно не передане
    const paymentDescription = req.body.paymentDescription || "Pending payment";

    // Якщо користувач авторизований, використовуємо кошик із бази даних
    if (req.user) {
      userId = req.user._id;
      const cart = await CartCollection.findOne({ userId })
        .populate('paintings.paintingId')
        .populate('merch.merchId');

      if (!cart || (cart.paintings.length === 0 && cart.merch.length === 0)) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      paintings = cart.paintings;
      merch = cart.merch;

      const unavailablePaintings = paintings.filter(
        (item) => !item.paintingId.available,
      );
      const unavailableMerch = merch.filter(
        (item) => !item.merchId.available,
      );

      if (unavailablePaintings.length > 0 || unavailableMerch.length > 0) {
        return res.status(400).json({
          message: 'Some items are no longer available',
          unavailable: [
            ...unavailablePaintings.map((item) => item.paintingId.title),
            ...unavailableMerch.map((item) => item.merchId.title),
          ],
        });
      }
    } else {
      // Для неавторизованих користувачів отримуємо кошик із тіла запиту
      const { cartItems } = req.body;

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Перевіряємо, чи всі елементи кошика мають коректний id
      const invalidItems = cartItems.filter((item) => !item.id || !mongoose.Types.ObjectId.isValid(item.id));
      if (invalidItems.length > 0) {
        return res.status(400).json({
          message: `Invalid item ids: ${invalidItems.map((item) => item.id || 'undefined').join(', ')}`,
        });
      }

      // Обробляємо картини
      const paintingItems = cartItems.filter((item) => item.type === 'painting');
      paintings = [];
      for (const item of paintingItems) {
        try {
          console.log(`Fetching painting with id: ${item.id}`);
          const painting = await PaintingCollection.findById(item.id);
          if (!painting) {
            return res.status(404).json({ message: `Painting with id ${item.id} not found` });
          }
          paintings.push({ paintingId: painting });
        } catch (error) {
          console.error(`Error fetching painting ${item.id}:`, error.message);
          return res.status(400).json({ message: `Error fetching painting ${item.id}: ${error.message}` });
        }
      }

      // Обробляємо мерч-товари
      const merchItems = cartItems.filter((item) => item.type === 'merch');
      merch = [];
      for (const item of merchItems) {
        try {
          console.log(`Fetching merch with id: ${item.id}`);
          const merchItem = await MerchCollection.findById(item.id);
          if (!merchItem) {
            return res.status(404).json({ message: `Merch item with id ${item.id} not found` });
          }
          merch.push({ merchId: merchItem });
        } catch (error) {
          console.error(`Error fetching merch ${item.id}:`, error.message);
          return res.status(400).json({ message: `Error fetching merch ${item.id}: ${error.message}` });
        }
      }

      const unavailablePaintings = paintings.filter(
        (item) => !item.paintingId.available,
      );
      const unavailableMerch = merch.filter(
        (item) => !item.merchId.available,
      );

      if (unavailablePaintings.length > 0 || unavailableMerch.length > 0) {
        return res.status(400).json({
          message: 'Some items are no longer available',
          unavailable: [
            ...unavailablePaintings.map((item) => item.paintingId.title),
            ...unavailableMerch.map((item) => item.merchId.title),
          ],
        });
      }
    }

    const totalPrice = paintings.reduce(
      (sum, item) => sum + item.paintingId.price,
      merch.reduce((sum, item) => sum + item.merchId.price, 0)
    );

    const order = await OrderCollection.create({
      userId: userId || null,
      paintings: paintings.map((item) => ({
        paintingId: item.paintingId._id,
      })),
      merch: merch.map((item) => ({
        merchId: item.merchId._id,
      })),
      totalPrice,
      status: 'pending',
      shippingDetails: req.body.shippingDetails,
      paymentDescription,
    });

    // Створюємо платіж (заглушка)
    const payment = await PaymentCollection.create({
      orderId: order._id,
      paymentProvider: 'direct',
      paymentStatus: 'pending',
      paymentUrl: walletAddress,
      amount: totalPrice,
      currency: 'USDT',
      transactionId: order._id.toString(),
    });

    // Оновлюємо замовлення з paymentId
    order.paymentId = payment._id;
    await order.save();

    await Promise.all([
      ...paintings.map((item) =>
        PaintingCollection.findByIdAndUpdate(item.paintingId._id, {
          available: false,
        })
      ),
      ...merch.map((item) =>
        MerchCollection.findByIdAndUpdate(item.merchId._id, {
          available: false,
        })
      ),
    ]);

    // Очищаємо кошик для авторизованих користувачів
    if (req.user) {
      const cart = await CartCollection.findOne({ userId });
      if (cart) {
        cart.paintings = [];
        cart.merch = [];
        await cart.save();
      }
    }

    return res.status(201).json({
      message: 'Order created successfully',
      data: {
        order,
        paymentAddress: walletAddress,
        amount: totalPrice,
        currency: 'USDT',
        paymentId: order._id.toString(),
      },
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

// Симуляція оплати
export const simulatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentCollection.findOne({ transactionId: paymentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const order = await OrderCollection.findById(payment.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Симулюємо успішну оплату
    payment.paymentStatus = 'completed';
    payment.transactionId = `SIMULATED_${paymentId}`;
    await payment.save();

    order.status = 'paid';
    await order.save();

    return res.status(200).json({
      message: 'Payment simulated successfully',
      data: {
        orderId: order._id,
        status: order.status,
        paymentStatus: payment.paymentStatus,
        message: 'Payment completed. Preparing for shipment.',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};