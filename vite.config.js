import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openAIProxyPlugin } from './server/openaiProxy.js';
import { anthropicProxyPlugin } from './server/anthropicProxy.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      openAIProxyPlugin({
        apiKey: process.env.OPENAI_API_KEY || env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || env.OPENAI_MODEL || 'gpt-5.6-terra',
        maxOutputTokens:
          process.env.OPENAI_MAX_OUTPUT_TOKENS || env.OPENAI_MAX_OUTPUT_TOKENS || 12000,
      }),
      anthropicProxyPlugin({
        apiKey: process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY || '',
        baseUrl:
          process.env.ANTHROPIC_BASE_URL ||
          env.ANTHROPIC_BASE_URL ||
          'https://api.anthropic.com',
        model: process.env.ANTHROPIC_MODEL || env.ANTHROPIC_MODEL || 'claude-opus-5',
        maxOutputTokens:
          process.env.ANTHROPIC_MAX_OUTPUT_TOKENS ||
          env.ANTHROPIC_MAX_OUTPUT_TOKENS ||
          16000,
        generationTimeoutMs:
          process.env.ANTHROPIC_GENERATION_TIMEOUT_MS ||
          env.ANTHROPIC_GENERATION_TIMEOUT_MS ||
          300000,
        structuredOutputs:
          process.env.ANTHROPIC_STRUCTURED_OUTPUTS ||
          env.ANTHROPIC_STRUCTURED_OUTPUTS ||
          'true',
      }),
    ],
  };
});
