import {
  extractAnthropicOutputText,
  generateAnthropicLesson,
  requestAnthropic,
} from '../server/anthropicProxy.js';
import { extractOpenAIOutputText, requestOpenAI } from '../server/openaiProxy.js';

const MAX_REQUEST_BYTES = 256 * 1024;

function jsonResponse(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function readJsonBody(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    const error = new Error('Request body is too large.');
    error.statusCode = 413;
    throw error;
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) {
    const error = new Error('Request body is too large.');
    error.statusCode = 413;
    throw error;
  }
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

function asBoolean(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;
  if (['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())) return true;
  if (['0', 'false', 'no', 'off'].includes(value.trim().toLowerCase())) return false;
  return fallback;
}

function asNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function handleAnthropic(request, env, pathname) {
  const apiKey = typeof env.ANTHROPIC_API_KEY === 'string' ? env.ANTHROPIC_API_KEY.trim() : '';
  const baseUrl = env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
  const model = env.ANTHROPIC_MODEL || 'claude-opus-5';
  const maxOutputTokens = asNumber(env.ANTHROPIC_MAX_OUTPUT_TOKENS, 16000);
  const generationTimeoutMs = asNumber(env.ANTHROPIC_GENERATION_TIMEOUT_MS, 300000);
  const structuredOutputs = asBoolean(env.ANTHROPIC_STRUCTURED_OUTPUTS, true);

  if (request.method === 'GET' && pathname === '/api/anthropic/status') {
    return jsonResponse({
      provider: 'anthropic',
      configured: Boolean(apiKey),
      model,
      baseUrl,
      generationTimeoutMs,
      structuredOutputs,
      keyLocation: 'cloudflare-secret',
    });
  }

  if (request.method === 'POST' && pathname === '/api/anthropic/test') {
    const response = await requestAnthropic({
      apiKey,
      baseUrl,
      model,
      timeoutMs: 30000,
      payload: {
        system: 'This is a connection test. Reply with exactly ANTHROPIC_OK.',
        messages: [{ role: 'user', content: 'Connection test' }],
        max_tokens: 32,
        thinking: { type: 'disabled' },
      },
    });

    return jsonResponse({
      success: true,
      configured: true,
      model: response.model || model,
      responseId: response.id || null,
      outputText: extractAnthropicOutputText(response),
    });
  }

  if (request.method === 'POST' && pathname === '/api/anthropic/generate') {
    const body = await readJsonBody(request);
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (prompt.length < 40) {
      const error = new Error('A complete lesson-plan prompt is required.');
      error.statusCode = 400;
      throw error;
    }

    const response = await generateAnthropicLesson({
      apiKey,
      baseUrl,
      model,
      prompt,
      maxOutputTokens: body.maxOutputTokens || maxOutputTokens,
      generationTimeoutMs,
      structuredOutputs,
    });
    const outputText = extractAnthropicOutputText(response);
    if (!outputText) {
      const error = new Error('Anthropic returned no lesson-plan text.');
      error.code = 'ANTHROPIC_EMPTY_RESPONSE';
      error.statusCode = 502;
      throw error;
    }

    return jsonResponse({
      success: true,
      model: response.model || model,
      responseId: response.id || null,
      responseIds: response.response_ids || undefined,
      outputText,
      usage: response.usage || null,
      stopReason: response.stop_reason || null,
    });
  }

  return jsonResponse({ success: false, error: 'Anthropic route not found.' }, 404);
}

async function handleOpenAI(request, env, pathname) {
  const apiKey = typeof env.OPENAI_API_KEY === 'string' ? env.OPENAI_API_KEY.trim() : '';
  const model = env.OPENAI_MODEL || 'gpt-5.6-terra';
  const maxOutputTokens = asNumber(env.OPENAI_MAX_OUTPUT_TOKENS, 12000);

  if (request.method === 'GET' && pathname === '/api/openai/status') {
    return jsonResponse({
      provider: 'openai',
      configured: Boolean(apiKey),
      model,
      keyLocation: 'cloudflare-secret',
    });
  }

  if (request.method === 'POST' && pathname === '/api/openai/test') {
    const response = await requestOpenAI({
      apiKey,
      model,
      timeoutMs: 30000,
      payload: {
        instructions: 'This is a connection test. Reply with exactly OPENAI_OK.',
        input: 'Connection test',
        max_output_tokens: 32,
      },
    });

    return jsonResponse({
      success: true,
      configured: true,
      model: response.model || model,
      responseId: response.id || null,
      outputText: extractOpenAIOutputText(response),
    });
  }

  if (request.method === 'POST' && pathname === '/api/openai/generate') {
    const body = await readJsonBody(request);
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (prompt.length < 40) {
      const error = new Error('A complete lesson-plan prompt is required.');
      error.statusCode = 400;
      throw error;
    }

    const response = await requestOpenAI({
      apiKey,
      model,
      payload: {
        instructions:
          'You are an expert Cambodian curriculum lesson-plan writer. Return only one valid JSON object in Khmer Unicode. Do not include Markdown fences or commentary.',
        input: prompt,
        max_output_tokens: Math.min(20000, Math.max(1000, Math.round(body.maxOutputTokens || maxOutputTokens))),
        text: { format: { type: 'json_object' } },
      },
    });
    const outputText = extractOpenAIOutputText(response);
    if (!outputText) {
      const error = new Error('OpenAI returned no lesson-plan text.');
      error.code = 'OPENAI_EMPTY_RESPONSE';
      error.statusCode = 502;
      throw error;
    }

    return jsonResponse({
      success: true,
      model: response.model || model,
      responseId: response.id || null,
      outputText,
      usage: response.usage || null,
    });
  }

  return jsonResponse({ success: false, error: 'OpenAI route not found.' }, 404);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    try {
      if (pathname.startsWith('/api/anthropic/')) {
        return await handleAnthropic(request, env, pathname);
      }
      if (pathname.startsWith('/api/openai/')) {
        return await handleOpenAI(request, env, pathname);
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      return jsonResponse(
        {
          success: false,
          code: error?.code || 'AI_PROXY_ERROR',
          error: error?.message || 'AI proxy request failed.',
        },
        error?.statusCode || 500,
      );
    }
  },
};
