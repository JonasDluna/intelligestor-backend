import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('⚠️  OpenAI API key not found in environment variables');
}

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export const OPENAI_CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-5',
  temperature: 0.7,
  max_completion_tokens: 2000
};

export default openai;
