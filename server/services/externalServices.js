import axios from 'axios';

const WIKI_USER_AGENT = 'SmartLibraryAI/1.0 (educational app contact: support@smartlibrary.local)';

const normalizeEnvValue = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const wrapped = raw.match(/^['\"](.*)['\"]$/);
  return (wrapped?.[1] || raw).trim();
};

const resolveAIConfig = () => {
  const apiKey = normalizeEnvValue(process.env.AI_API_KEY || process.env.OPENAI_API_KEY);
  const model = normalizeEnvValue(process.env.AI_MODEL) || 'gpt-4o-mini';
  return { apiKey, model };
};

const isLibraryIntent = (text) => {
  const lower = String(text || '').toLowerCase();
  const keywords = [
    'book',
    'library',
    'fine',
    'due',
    'return',
    'issue',
    'suggestion',
    'rating',
    'transaction',
    'student id'
  ];
  return keywords.some((word) => lower.includes(word));
};

const isDataBoundLibraryIntent = (text) => {
  const lower = String(text || '').toLowerCase();
  const keywords = ['fine', 'due', 'return', 'available', 'book', 'rule', 'policy', 'faq'];
  return keywords.some((word) => lower.includes(word));
};

const formatFaqSummary = (faq = []) => {
  if (!faq.length) return '';
  return faq
    .slice(0, 8)
    .map((item, index) => `${index + 1}. ${String(item.question || '').trim()} - ${String(item.answer || '').trim()}`)
    .join('\n');
};

const getTimeAnswer = () => {
  const now = new Date();
  const local = now.toLocaleString();
  const ist = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return `Current server local time: ${local}. Current India time (IST): ${ist}.`;
};

const getDateAnswer = () => {
  const now = new Date();
  return `Today's date is ${now.toLocaleDateString()}.`;
};

const normalizeGeneralQuery = (query) => {
  const text = String(query || '').trim();
  const lower = text.toLowerCase();

  if (lower.includes('rule') && lower.includes('library')) {
    return 'library rules for students';
  }

  if (lower.includes('what is java') && !lower.includes('island')) {
    return 'java programming language';
  }

  if (lower.includes('prime minister of india')) {
    return 'current prime minister of india';
  }

  if (lower.includes('pink city of india')) {
    return 'pink city in india';
  }

  const cmMatch = lower.match(/who\s+is\s+(the\s+)?cm\s+of\s+(.+?)\??$/i);
  if (cmMatch?.[2]) {
    return `current chief minister of ${cmMatch[2]} india`;
  }

  return text;
};

const fetchWikipediaSummary = async (title) => {
  const normalizedTitle = String(title || '').trim();
  if (!normalizedTitle) return '';

  try {
    const encoded = encodeURIComponent(normalizedTitle.replace(/\s+/g, '_'));
    const { data } = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
      headers: {
        'User-Agent': WIKI_USER_AGENT,
        'Api-User-Agent': WIKI_USER_AGENT
      },
      timeout: 12000
    });
    return String(data?.extract || '').trim();
  } catch {
    return '';
  }
};

const fetchWikipediaBySearch = async (query) => {
  const q = String(query || '').trim();
  if (!q) return '';

  try {
    const { data } = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: q,
        format: 'json',
        utf8: 1,
        srlimit: 1
      },
      headers: {
        'User-Agent': WIKI_USER_AGENT,
        'Api-User-Agent': WIKI_USER_AGENT
      },
      timeout: 12000
    });

    const firstTitle = data?.query?.search?.[0]?.title;
    if (!firstTitle) return '';

    return await fetchWikipediaSummary(firstTitle);
  } catch {
    return '';
  }
};

const toTitleCase = (value) =>
  String(value || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const extractStateFromCMQuery = (query) => {
  const text = String(query || '').trim();
  const match = text.match(/(?:cm|chief minister)\s+of\s+(.+?)\??$/i);
  return match?.[1] ? match[1].trim() : '';
};

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const fetchWikipediaIncumbent = async (pageTitle) => {
  const title = String(pageTitle || '').trim();
  if (!title) return '';

  try {
    const { data } = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'parse',
        page: title,
        prop: 'text',
        format: 'json'
      },
      headers: {
        'User-Agent': WIKI_USER_AGENT,
        'Api-User-Agent': WIKI_USER_AGENT
      },
      timeout: 12000
    });

    const html = String(data?.parse?.text?.['*'] || '');
    if (!html) return '';

    const incumbentInline = html.match(/Incumbent(?:<br\s*\/?>(?:\s|&nbsp;)?|\s|<[^>]+>)*<a[^>]*>([^<]+)<\/a>/i);
    if (incumbentInline?.[1]) {
      return String(incumbentInline[1]).replace(/\s+/g, ' ').trim();
    }

    const incumbentRow = html.match(/<th[^>]*>\s*Incumbent\s*<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    if (!incumbentRow?.[1]) return '';

    const firstLink = incumbentRow[1].match(/<a[^>]*>([^<]+)<\/a>/i);
    const candidate = firstLink?.[1] || stripHtml(incumbentRow[1]);

    return String(candidate || '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/\([^\)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
};

const fetchGeneralWebAnswer = async (query) => {
  const q = String(query || '').trim();
  if (!q) return '';

  const lower = q.toLowerCase();

  if (lower.includes('rule') && lower.includes('library')) {
    try {
      const { data } = await axios.get('https://api.duckduckgo.com/', {
        params: {
          q: 'library rules for students',
          format: 'json',
          no_html: 1,
          no_redirect: 1,
          skip_disambig: 1
        },
        timeout: 12000
      });

      const direct = String(data?.AbstractText || data?.Answer || '').trim();
      if (direct && direct.toLowerCase().includes('library')) return direct;

      const firstRelated = Array.isArray(data?.RelatedTopics)
        ? data.RelatedTopics.find((item) => {
            const text = String(item?.Text || '').toLowerCase();
            return text.includes('library') && (text.includes('rule') || text.includes('conduct'));
          })
        : null;

      if (firstRelated?.Text) return String(firstRelated.Text).trim();
    } catch (error) {
      console.error('[AI] Library rules web lookup failed:', error.message);
    }
  }

  if (lower.includes('time now') || lower === 'time' || lower.includes('current time')) {
    return getTimeAnswer();
  }

  if (lower === 'date' || lower.includes('today date') || lower.includes('current date')) {
    return getDateAnswer();
  }

  if (lower.includes('prime minister of india')) {
    const incumbentPm = await fetchWikipediaIncumbent('Prime Minister of India');
    if (incumbentPm) {
      return `The current Prime Minister of India is ${incumbentPm}.`;
    }

    const pmSummary =
      (await fetchWikipediaSummary('Prime Minister of India')) ||
      (await fetchWikipediaBySearch('current prime minister of India'));
    if (pmSummary) return pmSummary;
  }

  if (lower.includes('cm of') || lower.includes('chief minister of')) {
    const state = extractStateFromCMQuery(q);
    if (state) {
      const incumbentCm = await fetchWikipediaIncumbent(`Chief Minister of ${toTitleCase(state)}`);
      if (incumbentCm) {
        return `The current Chief Minister of ${toTitleCase(state)} is ${incumbentCm}.`;
      }
    }

    const cmTopic = normalizeGeneralQuery(q).replace(/^current\s+/i, '');
    const cmSummary =
      (await fetchWikipediaSummary(cmTopic)) ||
      (await fetchWikipediaBySearch(cmTopic));
    if (cmSummary) return cmSummary;
  }

  const wikiGeneric = await fetchWikipediaBySearch(normalizeGeneralQuery(q));
  if (wikiGeneric) return wikiGeneric;

  try {
    const normalizedQuery = normalizeGeneralQuery(q);
    const { data } = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: normalizedQuery,
        format: 'json',
        no_html: 1,
        no_redirect: 1,
        skip_disambig: 1
      },
      timeout: 12000
    });

    const direct = String(data?.AbstractText || data?.Answer || '').trim();
    if (direct) return direct;

    const firstRelated = Array.isArray(data?.RelatedTopics)
      ? data.RelatedTopics.find((item) => typeof item?.Text === 'string' && item.Text.trim())
      : null;

    return String(firstRelated?.Text || '').trim();
  } catch (error) {
    console.error('[AI] General web fallback failed:', error.message);
    return '';
  }
};

const extractLatestUserMessage = (prompt) => {
  const text = String(prompt || '').trim();
  if (!text) return '';

  const marker = 'User:';
  const idx = text.lastIndexOf(marker);
  if (idx === -1) return text;

  return text.slice(idx + marker.length).trim() || text;
};

const formatAvailableBooks = (availableBooks = []) => {
  if (!availableBooks.length) {
    return 'There are currently no books in stock.';
  }

  const top = availableBooks.slice(0, 8);
  const lines = top.map((book, index) => {
    const title = String(book.title || 'Untitled');
    const author = String(book.author || 'Unknown author');
    const stock = Number(book.available_quantity || 0);
    return `${index + 1}. ${title} by ${author} (Stock: ${stock})`;
  });

  const extraCount = availableBooks.length - top.length;
  if (extraCount > 0) {
    lines.push(`...and ${extraCount} more available books.`);
  }

  return lines.join('\n');
};

const formatFineSummary = (fines = []) => {
  if (!fines.length) {
    return 'You currently have no late fines.';
  }

  const pending = fines.filter((fine) => Number(fine.paid || 0) === 0);
  const source = pending.length > 0 ? pending : fines;
  const total = source.reduce((sum, fine) => sum + Number(fine.amount || 0), 0);

  const details = source
    .slice(0, 5)
    .map((fine, index) => `${index + 1}. Transaction #${fine.transaction_id}: Rs. ${Number(fine.amount || 0)} (${fine.days_late || 0} day(s) late)`)
    .join('\n');

  const label = pending.length > 0 ? 'Pending fine total' : 'Fine total';
  const more = source.length > 5 ? `\n...and ${source.length - 5} more fine record(s).` : '';

  return `${label}: Rs. ${total}\n${details}${more}`;
};

const localAssistantFallback = (prompt, options = {}) => {
  const availableBooks = Array.isArray(options.availableBooks) ? options.availableBooks : [];
  const fines = Array.isArray(options.fines) ? options.fines : [];
  const faq = Array.isArray(options.faq) ? options.faq : [];
  const text = extractLatestUserMessage(prompt);
  const lower = text.toLowerCase();

  if (!text) {
    return 'Please share your question. I can help with library tasks and general guidance.';
  }

  if (lower.includes('fine')) {
    return `Here is your fine summary from records:\n${formatFineSummary(fines)}`;
  }

  if (lower.includes('due') || lower.includes('return')) {
    return 'Please check My Books for due dates and return status. Returning books on time helps you avoid late fees.';
  }

  if ((lower.includes('rule') || lower.includes('policy')) && lower.includes('library')) {
    const faqSummary = formatFaqSummary(faq);
    if (faqSummary) {
      return `Library rules and policies from records:\n${faqSummary}`;
    }
    return 'Library FAQ/rules are not configured in database records yet. Please contact admin to add entries in library_faq.';
  }

  if (lower.includes('available') && lower.includes('book')) {
    return `Here are the books currently available:\n${formatAvailableBooks(availableBooks)}`;
  }

  if (lower.includes('book')) {
    return `You can browse books in Available Books. Current stock snapshot:\n${formatAvailableBooks(availableBooks)}`;
  }

  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! I am your Smart Library assistant. Ask me anything about books, due dates, fines, or general study help.';
  }

  if (lower.includes('time now') || lower === 'time' || lower.includes('current time')) {
    return getTimeAnswer();
  }

  return `I received your message: "${text}". I am running in offline assistant mode right now, but I can still help with library guidance and basic Q&A.`;
};

export const generateAIResponse = async (prompt, options = {}) => {
  const availableBooks = Array.isArray(options.availableBooks) ? options.availableBooks : [];
  const fines = Array.isArray(options.fines) ? options.fines : [];
  const faq = Array.isArray(options.faq) ? options.faq : [];
  const latestUserMessage = extractLatestUserMessage(prompt);
  const { apiKey, model } = resolveAIConfig();

  if (!apiKey || apiKey === 'demo_key') {
    if (!isDataBoundLibraryIntent(latestUserMessage)) {
      const webAnswer = await fetchGeneralWebAnswer(latestUserMessage);
      if (webAnswer) return webAnswer;
    }
    return localAssistantFallback(prompt, { availableBooks, fines, faq });
  }

  try {
    const availableBooksContext = formatAvailableBooks(availableBooks);
    const fineContext = formatFineSummary(fines);
    const faqContext = formatFaqSummary(faq) || 'No FAQ entries available.';
    const { data } = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for both general questions and Smart Library questions. For library availability/fines, use only the provided contexts. For general topics, answer normally and clearly.'
          },
          {
            role: 'system',
            content: `Available books list:\n${availableBooksContext}`
          },
          {
            role: 'system',
            content: `Student fine summary:\n${fineContext}`
          },
          {
            role: 'system',
            content: `Library FAQ and rules:\n${faqContext}`
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
    const status = error?.response?.status;
    const details = error?.response?.data || error.message;
    if (status === 401) {
      console.error('[AI] Invalid API key (401). Check AI_API_KEY or OPENAI_API_KEY in server environment.', details);
    } else if (status === 429) {
      console.error('[AI] Rate limit/quota issue (429).', details);
    } else {
      console.error('[AI] Request failed:', details);
    }

    if (!isDataBoundLibraryIntent(latestUserMessage)) {
      const webAnswer = await fetchGeneralWebAnswer(latestUserMessage);
      if (webAnswer) return webAnswer;
    }

    return localAssistantFallback(prompt, { availableBooks, fines, faq });
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