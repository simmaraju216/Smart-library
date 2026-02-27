import dotenv from 'dotenv';

dotenv.config();

export const smsConfig = {
  apiKey: process.env.SMS_API_KEY || 'demo_key'
};