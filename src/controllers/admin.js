import { PaintingCollection } from '../db/models/Painting.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js'; // Виправили шлях
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