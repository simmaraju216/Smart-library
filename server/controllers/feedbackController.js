import { addRating, addSuggestion, getRatings, getSuggestions } from '../models/feedbackModel.js';

export const createRating = async (req, res) => {
  const { rating, comment } = req.body;
  const id = await addRating({ student_id: req.user.id, rating, comment });
  res.status(201).json({ id, message: 'Rating submitted' });
};

export const createSuggestion = async (req, res) => {
  const { suggestion } = req.body;
  const id = await addSuggestion({ student_id: req.user.id, suggestion });
  res.status(201).json({ id, message: 'Suggestion submitted' });
};

export const listRatings = async (_req, res) => {
  const rows = await getRatings();
  res.json(rows);
};

export const listSuggestions = async (_req, res) => {
  const rows = await getSuggestions();
  res.json(rows);
};