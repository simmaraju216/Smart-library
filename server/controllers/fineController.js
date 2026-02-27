import { getAllFines, getFinesByStudent } from '../models/fineModel.js';

export const listFines = async (_req, res) => {
  const rows = await getAllFines();
  res.json(rows);
};

export const listMyFines = async (req, res) => {
  const rows = await getFinesByStudent(req.user.id);
  res.json(rows);
};