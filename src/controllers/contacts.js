import * as ContactServices from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';

import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { getEnvVar } from '../utils/getEnvVar.js';

const processPhoto = async (file) => {
  const cloudinaryEnable = getEnvVar('CLOUDINARY_ENABLE') === 'true';
  if (!file) return null;
  return cloudinaryEnable
    ? await saveFileToCloudinary(file)
    : await saveFileToUploadDir(file);
};

export const getContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);
    filter.userId = req.user._id;
    const contact = await ContactServices.getContact({
      page,
      perPage,
      sortBy,
      sortOrder,
      filter,
    });
    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

export const getContactsByIdController = async (req, res) => {
  const { _id: userId } = req.user;
  const { id: _id } = req.params;
  const data = await ContactServices.getContactWithId({ _id, userId });
  if (!data) {
    throw createHttpError(404, `Contact not found ${_id}`);
  }
  res.json({
    status: 200,
    message: `Successfully found contact with id ${_id}`,
    data,
  });
};

export const addContactController = async (req, res) => {
  const photo = await processPhoto(req.file);
  const { _id: userId } = req.user;
  const data = await ContactServices.addContact({
    ...req.body,
    photo,
    userId,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const upsertContactController = async (req, res) => {
  const photo = await processPhoto(req.file);
  const { id } = req.params;
  const { _id: userId } = req.user;
  const { isNew, data } = await ContactServices.updateContact(
    { _id: id, userId },
    { ...req.body, photo, userId },
    { upsert: true },
  );
  const status = isNew ? 201 : 200;
  res.status(status).json({
    status,
    message: 'Successfully patched a contact!',
    data,
  });
};

export const patchContactController = async (req, res) => {
  const photo = await processPhoto(req.file);
  const { id: _id } = req.params;
  const { _id: userId } = req.user;
  const result = await ContactServices.updateContact(
    { _id, userId },
    { ...req.body, photo },
  );

  if (!result) {
    throw createHttpError(404, `Contact not found`);
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result.data,
  });
};

export const deleteContactController = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: userId } = req.user;
  const data = await ContactServices.deleteContact({ _id, userId });
  if (!data) {
    throw createHttpError(404, `Contact not found${_id}`);
  }
  res.status(204).send();
};
