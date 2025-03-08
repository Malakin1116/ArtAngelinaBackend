import { CartCollection } from '../db/models/Cart.js';
import { PaintingCollection } from '../db/models/Painting.js';
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

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await CartCollection.findOne({ userId }).populate(
      'paintings.paintingId',
    );

    if (!cart) {
      return res.status(200).json({
        message: 'Cart is empty',
        data: { paintings: [] },
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

    if (paintingIndex === -1) {
      return res.status(404).json({ message: 'Painting not found in cart' });
    }

    await PaintingCollection.findByIdAndUpdate(paintingId, { available: true });

    cart.paintings.splice(paintingIndex, 1);
    await cart.save();

    return res
      .status(200)
      .json({ message: 'Painting removed from cart', cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const checkout = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await CartCollection.findOne({ userId }).populate(
      'paintings.paintingId',
    );
    if (!cart || cart.paintings.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const unavailablePaintings = cart.paintings.filter(
      (item) => !item.paintingId.available,
    );
    if (unavailablePaintings.length > 0) {
      return res.status(400).json({
        message: 'Some paintings are no longer available',
        unavailable: unavailablePaintings.map((item) => item.paintingId.title),
      });
    }

    const totalPrice = cart.paintings.reduce(
      (sum, item) => sum + item.paintingId.price,
      0,
    );

    const order = await OrderCollection.create({
      userId,
      paintings: cart.paintings.map((item) => ({
        paintingId: item.paintingId._id,
      })),
      totalPrice,
      status: 'pending',
    });

    await Promise.all(
      cart.paintings.map((item) =>
        PaintingCollection.findByIdAndUpdate(item.paintingId._id, {
          available: false,
        }),
      ),
    );

    cart.paintings = [];
    await cart.save();

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
