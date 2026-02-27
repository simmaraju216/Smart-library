import dotenv from 'dotenv';

dotenv.config();

export const aiConfig = {
  apiKey: process.env.AI_API_KEY || 'demo_key'
};