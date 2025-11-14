import express from 'express';
import { supabase } from '../config/supabase.js';
import { openai, OPENAI_CONFIG } from '../config/openai.js';

const router = express.Router();

// Example: Supabase query
router.get('/data', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }

    // Lista todas as tabelas disponíveis (retorna info de conexão)
    res.json({ 
      success: true, 
      message: 'Supabase connected successfully',
      info: 'Create a table in Supabase and update this endpoint',
      supabaseUrl: process.env.SUPABASE_URL
    });
  } catch (error) {
    console.error('Supabase error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Example: OpenAI chat completion
router.post('/chat', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: 'OpenAI not configured' });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Nova API Responses
    const response = await openai.responses.create({
      model: OPENAI_CONFIG.model,
      input: message
    });

    res.json({
      success: true,
      response: response.output_text
    });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Example: Combined Supabase + OpenAI
router.post('/analyze', async (req, res) => {
  try {
    if (!supabase || !openai) {
      return res.status(503).json({ 
        error: 'Required services not configured',
        services: { supabase: !!supabase, openai: !!openai }
      });
    }

    const { dataId, prompt } = req.body;

    // 1. Fetch data from Supabase
    const { data, error } = await supabase
      .from('your_table_name')
      .select('*')
      .eq('id', dataId)
      .single();

    if (error) throw error;

    // 2. Analyze with OpenAI
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        { role: 'system', content: 'You are a helpful data analyst.' },
        { role: 'user', content: `${prompt}\n\nData: ${JSON.stringify(data)}` }
      ],
      temperature: OPENAI_CONFIG.temperature,
      max_completion_tokens: OPENAI_CONFIG.max_completion_tokens
    });

    res.json({
      success: true,
      data,
      analysis: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
