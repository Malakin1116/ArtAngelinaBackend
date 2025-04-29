import { MerchCollection } from '../db/models/merch.js';
import createHttpError from 'http-errors';

export const getAllMerch = async (req, res) => {
  try {
    const merchItems = await MerchCollection.find();
    res.status(200).json({
      message: 'Merch retrieved successfully',
      merch: merchItems,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getMerchById = async (req, res) => {
  try {
    const { id } = req.params;
    const merch = await MerchCollection.findById(id);
    if (!merch) {
      throw createHttpError(404, 'Merch item not found');
    }
    res.status(200).json(merch); // Повертаємо об’єкт напряму
  } catch (error) {
    if (error.status === 404) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  }
};