import { PaintingCollection } from '../db/models/Painting.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

// Your existing addPainting function remains unchanged
export const addPainting = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const imageUrl = await saveFileToCloudinary(req.file);

    const newPainting = await PaintingCollection.create({
      title,
      description,
      price,
      image: imageUrl,
      available: true,
    });

    res.status(201).json({
      message: 'Painting added successfully',
      newPainting,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllPaintings = async (req, res) => {
  try {
    const paintings = await PaintingCollection.find();
    res.status(200).json({
      message: 'Paintings retrieved successfully',
      paintings: paintings,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
