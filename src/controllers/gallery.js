// import { PaintingCollection } from '../db/models/Painting.js';

// export const addPainting = async (req, res) => {
//   try {
//     const { title, description, price } = req.body;
//     const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

//     const newPainting = await PaintingCollection.create({
//       title,
//       description,
//       price,
//       image: imageUrl,
//       available: true,
//     });

//     res
//       .status(201)
//       .json({ message: 'Painting added successfully', newPainting });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

import { PaintingCollection } from '../db/models/Painting.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

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
