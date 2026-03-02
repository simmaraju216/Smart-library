import axios from 'axios';

export const generateAIResponse = async (prompt) => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey === 'demo_key') {
    return `Demo AI response: ${String(prompt || '').trim() || 'No prompt provided.'}`;
  }

  if (!apiKey) {
    console.error('[AI] Missing AI_API_KEY in environment.');
    return 'AI service is currently unavailable.';
  }

  try {
    const { data } = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful library assistant.'
          },
          {
            role: 'user',
            content: String(prompt || '')
          }
        ],
        temperature: 0.4
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const text = data?.choices?.[0]?.message?.content;
    return text ? String(text).trim() : 'AI returned an empty response.';
  } catch (error) {
    console.error('[AI] Request failed:', error.response?.data || error.message);
    return 'AI service is currently unavailable.';
  }
};

export const sendSMS = async (phone, message) => {
  const apiKey = process.env.SMS_API_KEY;

  if (apiKey === 'demo_key') {
    console.log(`[SMS-DEMO] To: ${phone} | Message: ${message}`);
    return { success: true, provider: 'demo' };
  }

  if (!apiKey) {
    console.error('[SMS] Missing SMS_API_KEY in environment.');
    return { success: false, provider: 'fast2sms', error: 'Missing SMS_API_KEY' };
  }

  try {
    const { data } = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'q',
        message: String(message || ''),
        language: 'english',
        numbers: String(phone || '')
      },
      {
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    return { success: true, provider: 'fast2sms', data };
  } catch (error) {
    console.error('[SMS] Request failed:', error.response?.data || error.message);
    return { success: false, provider: 'fast2sms', error: error.message };
  }
};