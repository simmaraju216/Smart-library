import { smsConfig } from '../config/smsConfig.js';

export const sendSmsReminder = async ({ phone, message }) => {
  return {
    success: true,
    provider: 'mock-sms-provider',
    apiKeyLoaded: Boolean(smsConfig.apiKey),
    phone,
    message
  };
};