const { GoogleGenAI } = require('@google/genai');
const env = require('../../config/env');

if (!env.geminiApiKey) {
  console.warn('⚠️ GEMINI_API_KEY is not set — the AI chat assistant will not work until it is configured in .env');
}

const genAI = new GoogleGenAI({ apiKey: env.geminiApiKey });

module.exports = genAI;