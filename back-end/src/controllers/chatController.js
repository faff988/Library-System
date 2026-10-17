const genAI = require('../lib/gemini');
const env = require('../../config/env');
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const MAX_HISTORY_TURNS = 8;
const MAX_HISTORY_CHARS = 1500; // long markdown replies shouldn't bloat every later request

// Optional second model to try if the main one is overloaded or rate-limited.
// Set GEMINI_FALLBACK_MODEL in .env to change it.
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite';

// ── Library data (built in, no separate helper file needed) ──────────────────
async function getGeneralLibrarySnapshot() {
  const [totalBooks, totalMembers, activeBorrows, totalDonations] = await Promise.all([
    prisma.books.count(),
    prisma.members.count(),
    prisma.borrow_records.count({ where: { status: { in: ['Borrowed', 'Overdue'] } } }),
    prisma.donations.count(),
  ]);
  return { totalBooks, totalMembers, activeBorrows, totalDonations };
}

// Top 10 most-borrowed books, which of them are low / out of stock, and for
// each of those a few other titles already held in the same category.
// Returns null when there is no borrow history yet.
async function getAcquisitionInsights() {
  const grouped = await prisma.borrow_records.groupBy({
    by: ['book_id'],
    _count: { _all: true },
    orderBy: { _count: { book_id: 'desc' } },
    take: 10,
  });
  if (grouped.length === 0) return null;

  const bookRows = await prisma.books.findMany({
    where: { book_id: { in: grouped.map((g) => g.book_id) } },
  });
  const bookById = new Map(bookRows.map((b) => [b.book_id, b]));

  const popular = grouped
    .map((g) => {
      const b = bookById.get(g.book_id);
      if (!b) return null;
      return {
        book_id: b.book_id,
        title: b.title,
        author: b.author,
        category: b.category,
        available_copies: b.available_copies ?? 0,
        total_copies: b.total_copies ?? 0,
        status: computeStatus(b),
        timesBorrowed: g._count._all,
      };
    })
    .filter(Boolean);

  const needsRestock = popular.filter((b) => b.status === 'LOW STOCK' || b.status === 'OUT OF STOCK');

  const similarByBookId = {};
  await Promise.all(
    needsRestock.map(async (b) => {
      similarByBookId[b.book_id] = b.category
        ? await prisma.books.findMany({
            where: { category: b.category, NOT: { book_id: b.book_id } },
            select: { title: true, author: true, available_copies: true, total_copies: true },
            orderBy: { added_at: 'desc' },
            take: 3,
          })
        : [];
    })
  );

  return { popular, needsRestock, similarByBookId };
}

// ── Intent detection ──────────────────────────────────────────────────────────
// Word-boundary regexes (the old substring check matched "add" inside
// "address", "additional", etc.). Order matters: "similar" is checked first so
// "Recommend similar books to our most popular titles" doesn't fall into the
// acquisition flow just because it contains "recommend" and "popular".
const SIMILAR_RE = /\b(similar|alike|more like|comparable)\b/i;
const ACQUISITION_RE = /\b(add|buy|purchase|acquire|restock|re-stock|stock up|order more|need more|demand|popular|most borrowed|borrow counts?|recommend\w*)\b/i;
const LOOKUP_RE = /\b(do we have|have we got|is there|are there|find|search|look ?up|any books?|copies of|in stock|written by|author)\b/i;

function detectIntent(message) {
  if (SIMILAR_RE.test(message)) return 'similar';
  if (ACQUISITION_RE.test(message)) return 'acquisition';
  if (LOOKUP_RE.test(message)) return 'lookup';
  return 'general';
}

// ── Prompts ───────────────────────────────────────────────────────────────────
const BASE_PERSONA = `You are the AI assistant built into the Siem Reap Bannalay Library Management System's staff dashboard. You help librarians and admins with the collection, members, borrowing activity and day-to-day operations.

How to answer:
- Lead with the answer. No greeting, no restating the question, no filler like "Great question".
- Keep it short: one or two sentences for simple questions (counts, yes/no, lookups). Use short bullet lists only when listing several items.
- Reply in the same language the user writes in (Khmer, English or French).
- Use Markdown. Never use tables or long paragraphs.
- Refer to the data as "your catalog" or "your records", never as "the DATA CONTEXT".

Facts and honesty:
- Every number, stock level, borrow count, status, member count or catalog fact must come from the DATA CONTEXT below. Never invent or estimate them.
- Use the exact Status values given. Never work out LOW STOCK or OUT OF STOCK yourself from the numbers.
- If the DATA CONTEXT doesn't cover the question, say so in one sentence and, if useful, say what you can answer instead.
- If the question isn't about the library, answer briefly if it is harmless general knowledge, then steer back to library help.
- If a question is vague, take the most reasonable interpretation and answer it. Ask a clarifying question only when you truly can't.
- End with at most one short follow-up offer, and only when it adds something.`;

const ACQUISITION_TEMPLATE = `This is a book acquisition question. For acquisition recommendations, ALWAYS use this exact structure:

**📚 1. Book Title**
*by Author*

- **Borrowed:** X times
- **Stock:** X/Y copies
- **Status:** **OUT OF STOCK** or **LOW STOCK**
- **Priority:** High / Medium / Low

💡 **Recommendation:** One short sentence explaining why this book should or should not be acquired.

---

**📚 2. Book Title**
(same structure)

After the recommendations, give one short **Overall recommendation** sentence.
Do not combine multiple books into one paragraph. Keep a blank line between books.`;

const SIMILAR_TEMPLATE = `This is a "similar books" request. Use the SIMILAR BOOKS data below. For up to 5 of the most-borrowed books, use exactly this structure:

**📚 1. Popular Book Title** — *Author* (X borrows)

- **Already in your catalog:** titles listed for that book in the data, or "nothing else in this category yet"
- **Suggested additions:** 1-2 titles written as *Title* by Author

💡 **Why:** One short sentence.

---

(repeat for each book, with a blank line between books)

Finish with one short **Overall recommendation** sentence.

Rules for "Suggested additions":
- These come from your general knowledge, not from the library data. Only name real, well-known published books you are confident exist, with the correct author. If you are not confident, write "no confident suggestion" instead of guessing.
- Match the subject and, where the data shows it, the language (Khmer, English or French) of the popular book.
- Never suggest a title that is already listed in the data.
- Never give stock or borrow numbers for suggested titles.
- After the last book add one italic line: *Suggested additions come from general knowledge, not your catalog. Check availability and ISBNs before ordering.*`;

const LOOKUP_TEMPLATE = `This is a catalog lookup. Use the CATALOG MATCHES data. For each matching book (maximum 5), write one line:
**Title** — Author · Dewey code · X/Y copies available · Status

If nothing matched, say you couldn't find a title matching those search terms in the catalog and suggest checking the spelling or searching the Inventory page. Never say a book doesn't exist in the library beyond "no match found for these terms".`;

// ── Data helpers ──────────────────────────────────────────────────────────────
// Same rules as booksController.computeStatus, so the assistant never
// disagrees with what the Inventory page shows.
function computeStatus(book) {
  const total = book.total_copies ?? 0;
  const available = book.available_copies ?? 0;
  if (total === 0 || available === 0) return 'OUT OF STOCK';
  if (available / total <= 0.3) return 'LOW STOCK';
  if (available < total) return 'BORROWED';
  return 'AVAILABLE';
}

const STOPWORDS = new Set([
  'do', 'we', 'have', 'has', 'had', 'got', 'is', 'are', 'there', 'any', 'the', 'an', 'of', 'by', 'in', 'our',
  'your', 'library', 'catalog', 'book', 'books', 'copy', 'copies', 'find', 'search', 'look', 'for', 'about',
  'written', 'author', 'stock', 'available', 'me', 'please', 'can', 'you', 'what', 'which', 'who', 'how',
  'many', 'much', 'on', 'at', 'to', 'and', 'or', 'with', 'from', 'this', 'that', 'it',
]);

function extractKeywords(message) {
  const words = message
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return [...new Set(words)].slice(0, 4);
}

async function searchCatalog(message) {
  const keywords = extractKeywords(message);
  if (keywords.length === 0) return { keywords, rows: [] };

  const rows = await prisma.books.findMany({
    where: {
      OR: keywords.flatMap((k) => [{ title: { contains: k } }, { author: { contains: k } }]),
    },
    select: { title: true, author: true, dewey_code: true, language: true, available_copies: true, total_copies: true },
    orderBy: { title: 'asc' },
    take: 8,
  });
  return { keywords, rows };
}

// Extra numbers so ordinary questions ("how many are overdue?", "how many
// Khmer books?") can be answered instead of hitting "I don't have that".
async function getExtraSnapshot() {
  const now = new Date();
  const [overdue, pendingFeedback, upcomingEvents, byCategory, byLanguage] = await Promise.all([
    prisma.borrow_records.count({ where: { status: { in: ['Borrowed', 'Overdue'] }, due_date: { lt: now } } }),
    prisma.feedback.count({ where: { status: 'pending' } }),
    prisma.events.count({ where: { event_date: { gte: now } } }),
    prisma.books.groupBy({ by: ['category'], _count: { _all: true } }),
    prisma.books.groupBy({ by: ['language'], _count: { _all: true } }),
  ]);
  return { overdue, pendingFeedback, upcomingEvents, byCategory, byLanguage };
}

// ── Context formatters ────────────────────────────────────────────────────────
function formatGeneralContext(snapshot, extra) {
  const today = new Date().toLocaleDateString('en-US', { dateStyle: 'full', timeZone: 'Asia/Phnom_Penh' });
  let text = `Today's date: ${today}

Current library snapshot:
- Total book titles in catalog: ${snapshot.totalBooks}
- Total registered members: ${snapshot.totalMembers}
- Currently active/overdue borrows: ${snapshot.activeBorrows}
- Total donation records: ${snapshot.totalDonations}`;

  if (extra) {
    const categories = extra.byCategory.map((c) => `${c.category}: ${c._count._all}`).join('; ') || 'none';
    const languages = extra.byLanguage.map((l) => `${l.language}: ${l._count._all}`).join('; ') || 'none';
    text += `
- Borrows past their due date right now: ${extra.overdue}
- Feedback waiting for a reply: ${extra.pendingFeedback}
- Upcoming events: ${extra.upcomingEvents}
- Titles per category: ${categories}
- Titles per language: ${languages}`;
  }
  return text;
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

// For "similar books": for each of the top borrowed titles, pull its language
// and a few other titles already in the same category, so the model can
// separate "what you already own" from "what could be added".
async function formatSimilarContext(insights) {
  if (!insights) {
    return 'No borrow history exists yet, so there are no popular books to base similar-book recommendations on.';
  }

  const top = insights.popular.slice(0, 5);

  const [meta, sameCategory] = await Promise.all([
    prisma.books.findMany({
      where: { title: { in: top.map((b) => b.title) } },
      select: { title: true, language: true, dewey_code: true },
    }),
    Promise.all(
      top.map((b) =>
        b.category
          ? prisma.books.findMany({
              where: { category: b.category, NOT: { title: b.title } },
              select: { title: true, author: true, available_copies: true, total_copies: true },
              orderBy: { added_at: 'desc' },
              take: 3,
            })
          : []
      )
    ),
  ]);
  const metaByTitle = new Map(meta.map((m) => [m.title, m]));

  const lines = top.map((b, i) => {
    const m = metaByTitle.get(b.title);
    const owned = sameCategory[i].length
      ? sameCategory[i].map((s) => `"${s.title}" by ${s.author} (${s.available_copies}/${s.total_copies} available)`).join(', ')
      : 'nothing else in this category yet';
    return `${i + 1}. "${b.title}" by ${b.author} - ${b.timesBorrowed} borrows - Category: ${b.category}${m ? ` - Language: ${m.language} - Dewey: ${m.dewey_code}` : ''} - Stock: ${b.available_copies}/${b.total_copies} (${b.status})
   Other titles already in this category: ${owned}`;
  });

  return `SIMILAR BOOKS data - most-borrowed books and what the catalog already holds in the same category:
${lines.join('\n')}`;
}

function formatCatalogMatches({ keywords, rows }) {
  if (rows.length === 0) {
    return `CATALOG MATCHES for search terms [${keywords.join(', ') || 'none'}]: no titles matched.`;
  }
  const lines = rows
    .map((b) => `- "${b.title}" by ${b.author} - Dewey: ${b.dewey_code} - Language: ${b.language} - ${b.available_copies}/${b.total_copies} copies available (${computeStatus(b)})`)
    .join('\n');
  return `CATALOG MATCHES for search terms [${keywords.join(', ')}]:\n${lines}`;
}

async function buildContext(message) {
  const intent = detectIntent(message);

  const snapshot = await getGeneralLibrarySnapshot();
  // The extra numbers are a bonus - never let them break the chat.
  const extra = await getExtraSnapshot().catch((err) => {
    console.warn('Extra assistant snapshot failed:', err.message);
    return null;
  });

  let contextText = formatGeneralContext(snapshot, extra);
  let template = '';

  if (intent === 'similar') {
    const insights = await getAcquisitionInsights();
    contextText += `\n\n${await formatSimilarContext(insights)}`;
    template = SIMILAR_TEMPLATE;
  } else if (intent === 'acquisition') {
    const insights = await getAcquisitionInsights();
    contextText += `\n\n${formatAcquisitionContext(insights)}`;
    template = ACQUISITION_TEMPLATE;
  } else if (intent === 'lookup') {
    contextText += `\n\n${formatCatalogMatches(await searchCatalog(message))}`;
    template = LOOKUP_TEMPLATE;
  }

  return { intent, contextText, template };
}

// ── Gemini call with retry + fallback ─────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 429 = rate limit / quota, 500/503/504 = Gemini overloaded or flaky.
// These are worth retrying; anything else (bad key, bad request, unknown
// model) will fail the same way every time, so it is thrown straight away.
function isRetryable(err) {
  const status = err?.status ?? err?.code;
  return [429, 500, 503, 504].includes(Number(status));
}

async function callModel(model, contents, systemInstruction, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      return await genAI.models.generateContent({
        model,
        contents,
        config: { systemInstruction },
      });
    } catch (err) {
      console.error(`Gemini call failed (model: ${model}, attempt ${attempt}/${tries}):`, err?.status ?? err?.code, err?.message);
      if (!isRetryable(err) || attempt === tries) throw err;
      await sleep(1500 * attempt);
    }
  }
}

async function generateReply(contents, systemInstruction) {
  try {
    return await callModel(env.geminiModel, contents, systemInstruction);
  } catch (err) {
    // Main model is overloaded or rate-limited: try the lighter fallback once.
    if (isRetryable(err) && FALLBACK_MODEL && FALLBACK_MODEL !== env.geminiModel) {
      console.warn(`Falling back to ${FALLBACK_MODEL}`);
      return await callModel(FALLBACK_MODEL, contents, systemInstruction, 1);
    }
    throw err;
  }
}

// ── Controller ────────────────────────────────────────────────────────────────
const send = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    throw ApiError.badRequest('message is required');
  }
  if (!env.geminiApiKey || !genAI) {
    throw ApiError.badRequest('The AI assistant is not configured yet - GEMINI_API_KEY is missing from the server environment.');
  }

  const { template, contextText } = await buildContext(message);

  const systemInstruction = [BASE_PERSONA, template, `DATA CONTEXT:\n${contextText}`]
    .filter(Boolean)
    .join('\n\n');

  const trimmedHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_TURNS) : [];
  const mappedHistory = trimmedHistory
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({
      role: m.sender === 'me' ? 'user' : 'model',
      parts: [{ text: m.text.slice(0, MAX_HISTORY_CHARS) }],
    }));
  // Gemini expects the conversation to start on a user turn - drop any
  // leading assistant messages (e.g. the frontend's static greeting bubble).
  const firstUserIndex = mappedHistory.findIndex((m) => m.role === 'user');
  const contents = firstUserIndex === -1 ? [] : mappedHistory.slice(firstUserIndex);
  contents.push({ role: 'user', parts: [{ text: message.trim() }] });

  let reply;
  try {
    const response = await generateReply(contents, systemInstruction);
    reply = response.text;
  } catch (err) {
    // Full details go to the server console; the user only sees a friendly message.
    console.error('Gemini API call failed (final):', err?.status ?? err?.code, err?.message);
    throw new ApiError(503, 'The AI assistant is temporarily unavailable. Please try again in a moment.');
  }

  if (!reply) {
    throw new ApiError(503, 'The AI assistant did not return a response. Please try again.');
  }

  res.json({ success: true, data: { reply } });
});

module.exports = { send };