import { aiConfig } from '../config/aiConfig.js';

export const getAIReply = async (query) => {
  const canned = {
    rules: 'Books are issued for 7 days. Late return incurs daily charges.',
    issue: 'Contact admin desk for manual issue confirmation.',
    fine: 'Fine is calculated as 5 per day after due date.'
  };

  const normalized = String(query || '').toLowerCase();
  if (normalized.includes('rule')) return { reply: canned.rules, apiKeyLoaded: Boolean(aiConfig.apiKey) };
  if (normalized.includes('issue')) return { reply: canned.issue, apiKeyLoaded: Boolean(aiConfig.apiKey) };
  if (normalized.includes('fine')) return { reply: canned.fine, apiKeyLoaded: Boolean(aiConfig.apiKey) };
  return { reply: 'I can help with issue process, return rules, fines, and library guidance.', apiKeyLoaded: Boolean(aiConfig.apiKey) };
};