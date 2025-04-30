import { CartCollection } from '../db/models/Cart.js';
import { PaintingCollection } from '../db/models/Painting.js';
import { MerchCollection } from '../db/models/merch.js';
import { OrderCollection } from '../db/models/Order.js';

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
      const { cartItems, shippingDetails } = req.body;

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Перевіряємо доступність товарів
      paintings = await Promise.all(
        cartItems
          .filter((item) => item.type === 'painting')
          .map(async (item) => {
            const painting = await PaintingCollection.findById(item.id);
            return { paintingId: painting };
          })
      );

      merch = await Promise.all(
        cartItems
          .filter((item) => item.type === 'merch')
          .map(async (item) => {
            const merchItem = await MerchCollection.findById(item.id);
            return { merchId: merchItem };
          })
      );

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

      // Зберігаємо дані доставки у замовлення для неавторизованих користувачів
      req.shippingDetails = shippingDetails;
    }

    const totalPrice = paintings.reduce(
      (sum, item) => sum + item.paintingId.price,
      merch.reduce((sum, item) => sum + item.merchId.price, 0)
    );

    const order = await OrderCollection.create({
      userId: userId || null, // Для неавторизованих користувачів userId буде null
      paintings: paintings.map((item) => ({
        paintingId: item.paintingId._id,
      })),
      merch: merch.map((item) => ({
        merchId: item.merchId._id,
      })),
      totalPrice,
      status: 'pending',
      shippingDetails: req.shippingDetails || req.body.shippingDetails, // Додаємо дані доставки
    });

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
      data: order,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};