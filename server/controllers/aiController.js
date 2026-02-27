import { getAIReply } from '../services/aiService.js';

export const askAI = async (req, res) => {
  const { query } = req.body;
  const data = await getAIReply(query);
  res.json(data);
};