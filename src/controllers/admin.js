import { PaintingCollection } from '../db/models/Painting.js';
import { MerchCollection } from '../db/models/merch.js';
import { OrderCollection } from '../db/models/Order.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import createHttpError from 'http-errors';

export const addPainting = async (req, res) => {
  const { title, description, price } = req.body;
  let imageUrl;

  if (req.file) {
    imageUrl = await saveFileToCloudinary(req.file);
  } else {
    throw createHttpError(400, 'Image is required');
  }

  const painting = await PaintingCollection.create({
    title,
    description,
    price: Number(price),
    image: imageUrl,
    available: true,
  });

  res.status(201).json({
    status: 201,
    message: 'Painting added successfully',
    data: painting,
  });
};

export const getAllPaintings = async (req, res) => {
  const paintings = await PaintingCollection.find();
  res.json({
    status: 200,
    message: 'Paintings retrieved successfully',
    data: paintings,
  });
};

export const updatePainting = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, available } = req.body;
  let imageUrl;

  if (req.file) {
    imageUrl = await saveFileToCloudinary(req.file);
  }

  const updateData = {
    ...(title && { title }),
    ...(description && { description }),
    ...(price && { price: Number(price) }),
    ...(typeof available !== 'undefined' && { available }),
    ...(imageUrl && { image: imageUrl }),
  };

  const painting = await PaintingCollection.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!painting) {
    throw createHttpError(404, 'Painting not found');
  }

  res.json({
    status: 200,
    message: 'Painting updated successfully',
    data: painting,
  });
};

export const deletePainting = async (req, res) => {
  const { id } = req.params;
  const painting = await PaintingCollection.findByIdAndDelete(id);

  if (!painting) {
    throw createHttpError(404, 'Painting not found');
  }

  res.status(204).send();
};

// Контролери для мерчу
export const addMerch = async (req, res) => {
  const { title, description, price } = req.body;
  let imageUrl;

  if (req.file) {
    imageUrl = await saveFileToCloudinary(req.file);
  } else {
    throw createHttpError(400, 'Image is required');
  }

  const merch = await MerchCollection.create({
    title,
    description,
    price: Number(price),
    image: imageUrl,
    available: true,
  });

  res.status(201).json({
    status: 201,
    message: 'Merch added successfully',
    data: merch,
  });
};

export const getAllMerch = async (req, res) => {
  const merchItems = await MerchCollection.find();
  res.json({
    status: 200,
    message: 'Merch retrieved successfully',
    data: merchItems,
  });
};

export const updateMerch = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, available } = req.body;
  let imageUrl;

  if (req.file) {
    imageUrl = await saveFileToCloudinary(req.file);
  }

  const updateData = {
    ...(title && { title }),
    ...(description && { description }),
    ...(price && { price: Number(price) }),
    ...(typeof available !== 'undefined' && { available }),
    ...(imageUrl && { image: imageUrl }),
  };

  const merch = await MerchCollection.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!merch) {
    throw createHttpError(404, 'Merch item not found');
  }

  res.json({
    status: 200,
    message: 'Merch updated successfully',
    data: merch,
  });
};

export const deleteMerch = async (req, res) => {
  const { id } = req.params;
  const merch = await MerchCollection.findByIdAndDelete(id);

  if (!merch) {
    throw createHttpError(404, 'Merch item not found');
  }

  res.status(204).send();
};

// Контролери для замовлень
export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderCollection.find()
      .populate('paintings.paintingId')
      .populate('merch.merchId')
      .populate('paymentId');
    res.status(200).json({
      status: 200,
      message: 'Orders retrieved successfully',
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await OrderCollection.findById(id);
    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      status: 200,
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await OrderCollection.findById(id);
    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

    // Повертаємо товари в доступність
    await Promise.all([
      ...order.paintings.map((item) =>
        PaintingCollection.findByIdAndUpdate(item.paintingId, {
          available: true,
        })
      ),
      ...order.merch.map((item) =>
        MerchCollection.findByIdAndUpdate(item.merchId, {
          available: true,
        })
      ),
    ]);

    await OrderCollection.deleteOne({ _id: id });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};