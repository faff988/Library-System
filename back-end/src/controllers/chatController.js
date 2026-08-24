const genAI = require('../lib/gemini');
const env = require('../../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getGeneralLibrarySnapshot, getAcquisitionInsights } = require('../utils/libraryAssistantContext');

const MAX_HISTORY_TURNS = 8;

const ACQUISITION_KEYWORDS = [
  'add', 'buy', 'purchase', 'acquire', 'restock', 'stock up', 'order more',
  'need more', 'popular', 'most borrowed', 'recommend', 'similar', 'demand',
];

function needsAcquisitionContext(message) {
  const lower = message.toLowerCase();
  return ACQUISITION_KEYWORDS.some((kw) => lower.includes(kw));
}

const SYSTEM_PERSONA = `You are the AI assistant embedded in the Siem Reap Bannalay Library Management System's staff dashboard.

You help librarians and admin staff with questions about the library's collection, members, borrowing activity, and day-to-day operations.

Rules:
- Base every factual claim strictly on the DATA CONTEXT provided below.
- Never invent titles, authors, numbers, categories, or stock information.
- If the DATA CONTEXT doesn't cover what's being asked, say plainly that you don't have that information.
- Keep answers concise and practical.
- Use Markdown formatting.
- Do not use markdown tables.
- Do not use long paragraphs.

For book acquisition recommendations, ALWAYS use this exact structure:

**📚 1. Book Title**
*by Author*

- **Borrowed:** X times
- **Stock:** X/Y copies
- **Status:** **OUT OF STOCK** or **LOW STOCK**
- **Priority:** High / Medium / Low

💡 **Recommendation:** One short sentence explaining why this book should or should not be acquired.

---

**📚 2. Book Title**
*by Author*

- **Borrowed:** X times
- **Stock:** X/Y copies
- **Status:** **OUT OF STOCK** or **LOW STOCK**
- **Priority:** High / Medium / Low

💡 **Recommendation:** One short sentence explaining why.

After the recommendations, provide one short **Overall recommendation** sentence.

Do not combine multiple books into the same paragraph.
Do not omit blank lines between books.

- Never calculate or change a book's stock status yourself.
- Use the exact Status value provided in DATA CONTEXT.
- Do not infer LOW STOCK or OUT OF STOCK from the numbers.`;

function formatGeneralContext(snapshot) {
  return `Current library snapshot:
- Total book titles in catalog: ${snapshot.totalBooks}
- Total registered members: ${snapshot.totalMembers}
- Currently active/overdue borrows: ${snapshot.activeBorrows}
- Total donation records: ${snapshot.totalDonations}`;
}

function formatAcquisitionContext(insights) {
  if (!insights) {
    return 'No borrow history exists yet, so there is no borrow-count data to base acquisition recommendations on.';
  }

  const popularLines = insights.popular
    .map((b, i) => `${i + 1}. "${b.title}" by ${b.author} - ${b.timesBorrowed} borrows - Category: ${b.category} - Stock: ${b.available_copies}/${b.total_copies} (${b.status})`)
    .join('\n');

  const restockLines = insights.needsRestock.length
    ? insights.needsRestock
        .map((b) => {
          const similar = insights.similarByBookId[b.book_id] || [];
          const similarText = similar.length
            ? similar.map((s) => `"${s.title}" by ${s.author} (${s.available_copies}/${s.total_copies} available)`).join(', ')
            : 'no other titles currently in this category';
          return `- "${b.title}" (${b.timesBorrowed} borrows, ${b.status}) - similar titles already in the catalog: ${similarText}`;
        })
        .join('\n')
    : 'None of the top-borrowed books are currently low or out of stock.';

  return `Top ${insights.popular.length} most-borrowed books of all time:
${popularLines}

Popular books that are LOW STOCK or OUT OF STOCK (strong acquisition candidates - buy more copies of these, or of similar titles in the same category):
${restockLines}`;
}

const send = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    throw ApiError.badRequest('message is required');
  }
  if (!env.geminiApiKey) {
    throw ApiError.badRequest('The AI assistant is not configured yet - GEMINI_API_KEY is missing from the server environment.');
  }

  const snapshot = await getGeneralLibrarySnapshot();
  let contextText = formatGeneralContext(snapshot);

  if (needsAcquisitionContext(message)) {
    const insights = await getAcquisitionInsights();
    contextText += `\n\n${formatAcquisitionContext(insights)}`;
  }

  const systemInstruction = `${SYSTEM_PERSONA}\n\nDATA CONTEXT:\n${contextText}`;

  const trimmedHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_TURNS) : [];
  const mappedHistory = trimmedHistory.map((m) => ({
    role: m.sender === 'me' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));
  // Gemini expects the conversation to start on a user turn - drop any
  // leading assistant messages (e.g. the frontend's static greeting bubble).
  const firstUserIndex = mappedHistory.findIndex((m) => m.role === 'user');
  const contents = firstUserIndex === -1 ? [] : mappedHistory.slice(firstUserIndex);
  contents.push({ role: 'user', parts: [{ text: message.trim() }] });

  let reply;
  try {
    const response = await genAI.models.generateContent({
      model: env.geminiModel,
      contents,
      config: { systemInstruction },
    });
    reply = response.text;
  } catch (err) {
    console.error('Gemini API call failed:', err.message);
    throw new ApiError(503, 'The AI assistant is temporarily unavailable. Please try again in a moment.');
  }

  if (!reply) {
    throw new ApiError(503, 'The AI assistant did not return a response. Please try again.');
  }

  res.json({ success: true, data: { reply } });
});

module.exports = { send };