import { lessonPlanSchema } from './lessonPlanSchema.js';

const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const ANTHROPIC_API_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-opus-5';
const DEFAULT_MAX_OUTPUT_TOKENS = 16000;
const DEFAULT_GENERATION_TIMEOUT_MS = 300000;
const MAX_REQUEST_BYTES = 256 * 1024;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_REQUEST_BYTES) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

export function extractAnthropicOutputText(response) {
  return (response?.content || [])
    .filter((block) => block?.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

async function readAnthropicEventStream(response) {
  if (!response.body) {
    const error = new Error('Anthropic returned an empty event stream.');
    error.code = 'ANTHROPIC_EMPTY_STREAM';
    error.statusCode = 502;
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let message = null;
  let outputText = '';
  let stopReason = null;
  let stopSequence = null;
  let usage = {};

  const consumeEvent = (eventBlock) => {
    const dataText = eventBlock
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n')
      .trim();

    if (!dataText || dataText === '[DONE]') return;

    let event;
    try {
      event = JSON.parse(dataText);
    } catch {
      return;
    }

    if (event.type === 'error') {
      const error = new Error(event.error?.message || 'Anthropic stream failed.');
      error.code = event.error?.code || event.error?.type || 'ANTHROPIC_STREAM_ERROR';
      error.statusCode = 502;
      throw error;
    }

    if (event.type === 'message_start') {
      message = event.message || null;
      usage = { ...(event.message?.usage || {}) };
      return;
    }

    if (event.type === 'content_block_start' && event.content_block?.type === 'text') {
      outputText += event.content_block.text || '';
      return;
    }

    if (event.type === 'content_block_delta') {
      outputText += event.delta?.text || event.delta?.partial_json || '';
      return;
    }

    if (event.type === 'message_delta') {
      stopReason = event.delta?.stop_reason || stopReason;
      stopSequence = event.delta?.stop_sequence || stopSequence;
      usage = { ...usage, ...(event.usage || {}) };
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const eventBlocks = buffer.split(/\r?\n\r?\n/);
    buffer = eventBlocks.pop() || '';
    eventBlocks.forEach(consumeEvent);
  }

  buffer += decoder.decode();
  if (buffer.trim()) consumeEvent(buffer);

  if (!message) {
    const error = new Error('Anthropic stream ended before the response started.');
    error.code = 'ANTHROPIC_INCOMPLETE_STREAM';
    error.statusCode = 502;
    throw error;
  }

  return {
    ...message,
    content: [{ type: 'text', text: outputText }],
    stop_reason: stopReason || message.stop_reason || null,
    stop_sequence: stopSequence || message.stop_sequence || null,
    usage: Object.keys(usage).length > 0 ? usage : message.usage || null,
  };
}

function normalizeModel(model) {
  return typeof model === 'string' && model.trim() ? model.trim() : DEFAULT_MODEL;
}

function normalizeBaseUrl(baseUrl) {
  const candidate =
    typeof baseUrl === 'string' && baseUrl.trim() ? baseUrl.trim() : DEFAULT_BASE_URL;
  const withoutApiPath = candidate.replace(/\/+$/, '').replace(/\/v1$/i, '');

  let parsed;
  try {
    parsed = new URL(withoutApiPath);
  } catch {
    throw new Error('ANTHROPIC_BASE_URL must be a valid HTTPS URL.');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('ANTHROPIC_BASE_URL must use HTTPS.');
  }

  parsed.search = '';
  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

function normalizeMaxOutputTokens(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_MAX_OUTPUT_TOKENS;
  return Math.min(32000, Math.max(1000, Math.round(parsed)));
}

function normalizeGenerationTimeoutMs(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_GENERATION_TIMEOUT_MS;
  return Math.min(600000, Math.max(30000, Math.round(parsed)));
}

function normalizeBoolean(value, fallback) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;
  if (['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())) return true;
  if (['0', 'false', 'no', 'off'].includes(value.trim().toLowerCase())) return false;
  return fallback;
}

function cleanAndParseJson(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  let candidate = text.trim();
  if (candidate.startsWith('```')) {
    candidate = candidate.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace >= firstBrace) {
    candidate = candidate.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(candidate);
}

function mergeAnthropicUsage(responses) {
  const totals = {};
  responses.forEach((response) => {
    Object.entries(response?.usage || {}).forEach(([key, value]) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        totals[key] = (totals[key] || 0) + value;
      }
    });
  });
  return Object.keys(totals).length > 0 ? totals : null;
}

function assertCompleteLessonPlan(plan) {
  const missingKeys = lessonPlanSchema.required.filter(
    (key) => !Object.prototype.hasOwnProperty.call(plan || {}, key),
  );
  if (missingKeys.length > 0) {
    const error = new Error(`Claude omitted required lesson fields: ${missingKeys.join(', ')}.`);
    error.code = 'ANTHROPIC_INCOMPLETE_RESPONSE';
    error.statusCode = 502;
    throw error;
  }
}

export async function requestAnthropic({
  apiKey,
  baseUrl = DEFAULT_BASE_URL,
  model = DEFAULT_MODEL,
  payload,
  fetchImpl = globalThis.fetch,
  timeoutMs = 120000,
}) {
  if (!apiKey) {
    const error = new Error('Anthropic is not configured on the server.');
    error.code = 'ANTHROPIC_NOT_CONFIGURED';
    error.statusCode = 503;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${normalizeBaseUrl(baseUrl)}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: normalizeModel(model), ...payload }),
      signal: controller.signal,
    });

    if (response.ok && payload?.stream) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        return readAnthropicEventStream(response);
      }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        data?.error?.message || `Anthropic request failed with HTTP ${response.status}.`,
      );
      error.code = data?.error?.code || data?.error?.type || 'ANTHROPIC_REQUEST_FAILED';
      error.statusCode = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Anthropic request timed out.');
      timeoutError.code = 'ANTHROPIC_TIMEOUT';
      timeoutError.statusCode = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateAnthropicLesson({
  apiKey,
  baseUrl = DEFAULT_BASE_URL,
  model = DEFAULT_MODEL,
  prompt,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
  generationTimeoutMs = DEFAULT_GENERATION_TIMEOUT_MS,
  structuredOutputs = true,
  fetchImpl = globalThis.fetch,
}) {
  const resolvedBaseUrl = normalizeBaseUrl(baseUrl);
  const resolvedModel = normalizeModel(model);
  const resolvedGenerationTimeoutMs = normalizeGenerationTimeoutMs(generationTimeoutMs);
  const resolvedStructuredOutputs = normalizeBoolean(structuredOutputs, true);
  const requestedMaxTokens = normalizeMaxOutputTokens(maxOutputTokens);
  const system =
    'You are an expert Cambodian curriculum lesson-plan writer. Write natural Khmer Unicode and follow the supplied curriculum boundary exactly.';

  if (resolvedStructuredOutputs) {
    return requestAnthropic({
      apiKey,
      baseUrl: resolvedBaseUrl,
      model: resolvedModel,
      fetchImpl,
      timeoutMs: resolvedGenerationTimeoutMs,
      payload: {
        system,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: requestedMaxTokens,
        stream: true,
        thinking: { type: 'disabled' },
        output_config: {
          format: {
            type: 'json_schema',
            schema: lessonPlanSchema,
          },
        },
      },
    });
  }

  const partMaxTokens = Math.min(1100, Math.max(1000, Math.ceil(requestedMaxTokens / 3)));
  const partInstructions = [
    `PARTIAL RESPONSE OVERRIDE: Return ONLY a JSON object containing these keys from the requested lesson: objectives, blackboardSummary, misconceptionsAlert, differentiatedInstruction, assessmentRubric, handsOnActivity, and teachingAids. Preserve their exact nested field names from the lesson brief. Keep each value concise and classroom-ready so the entire response fits within ${partMaxTokens} tokens. Do not include fiveStepsProcess or fullWorksheet. Do not use Markdown or commentary.`,
    `PARTIAL RESPONSE OVERRIDE: Return ONLY a JSON object with the key fiveStepsProcess. It must contain exactly the five requested 5E phases, their required timeMins, and the exact nested field names from the lesson brief. Keep each activity concise and classroom-ready so the entire response fits within ${partMaxTokens} tokens. Do not include any other top-level key. Do not use Markdown or commentary.`,
    `PARTIAL RESPONSE OVERRIDE: Return ONLY a JSON object with the key fullWorksheet. Preserve the exact nested field names from the lesson brief and include exactly five questions in the requested three sections, with answers and explanations. Keep wording concise so the entire response fits within ${partMaxTokens} tokens. Do not include any other top-level key. Do not use Markdown or commentary.`,
  ];

  const partResponses = await Promise.all(
    partInstructions.map((instruction) =>
      requestAnthropic({
        apiKey,
        baseUrl: resolvedBaseUrl,
        model: resolvedModel,
        fetchImpl,
        timeoutMs: resolvedGenerationTimeoutMs,
        payload: {
          system,
          messages: [{ role: 'user', content: `${prompt}\n\n${instruction}` }],
          max_tokens: partMaxTokens,
          stream: true,
          thinking: { type: 'disabled' },
        },
      }),
    ),
  );

  const combinedPlan = Object.assign(
    {},
    ...partResponses.map((partResponse) =>
      cleanAndParseJson(extractAnthropicOutputText(partResponse)),
    ),
  );
  assertCompleteLessonPlan(combinedPlan);

  return {
    ...partResponses[0],
    content: [{ type: 'text', text: JSON.stringify(combinedPlan) }],
    usage: mergeAnthropicUsage(partResponses),
    stop_reason: partResponses.every((part) => part.stop_reason === 'end_turn')
      ? 'end_turn'
      : partResponses.find((part) => part.stop_reason !== 'end_turn')?.stop_reason || null,
    response_ids: partResponses.map((part) => part.id).filter(Boolean),
  };
}

export function createAnthropicRequestHandler({
  apiKey = '',
  baseUrl = DEFAULT_BASE_URL,
  model = DEFAULT_MODEL,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
  generationTimeoutMs = DEFAULT_GENERATION_TIMEOUT_MS,
  structuredOutputs = true,
  fetchImpl = globalThis.fetch,
} = {}) {
  const resolvedKey = typeof apiKey === 'string' ? apiKey.trim() : '';
  const resolvedBaseUrl = normalizeBaseUrl(baseUrl);
  const resolvedModel = normalizeModel(model);
  const resolvedGenerationTimeoutMs = normalizeGenerationTimeoutMs(generationTimeoutMs);
  const resolvedStructuredOutputs = normalizeBoolean(structuredOutputs, true);

  return async function anthropicRequestHandler(req, res, next) {
    const url = new URL(req.url || '/', 'http://localhost');
    if (!url.pathname.startsWith('/api/anthropic/')) {
      next();
      return;
    }

    try {
      if (req.method === 'GET' && url.pathname === '/api/anthropic/status') {
        sendJson(res, 200, {
          provider: 'anthropic',
          configured: Boolean(resolvedKey),
          model: resolvedModel,
          baseUrl: resolvedBaseUrl,
          generationTimeoutMs: resolvedGenerationTimeoutMs,
          structuredOutputs: resolvedStructuredOutputs,
          keyLocation: 'server-environment',
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/anthropic/test') {
        const response = await requestAnthropic({
          apiKey: resolvedKey,
          baseUrl: resolvedBaseUrl,
          model: resolvedModel,
          fetchImpl,
          timeoutMs: 30000,
          payload: {
            system: 'This is a connection test. Reply with exactly ANTHROPIC_OK.',
            messages: [{ role: 'user', content: 'Connection test' }],
            max_tokens: 32,
            thinking: { type: 'disabled' },
          },
        });

        sendJson(res, 200, {
          success: true,
          configured: true,
          model: response.model || resolvedModel,
          responseId: response.id || null,
          outputText: extractAnthropicOutputText(response),
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/anthropic/generate') {
        const body = await readJsonBody(req);
        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
        if (prompt.length < 40) {
          const error = new Error('A complete lesson-plan prompt is required.');
          error.statusCode = 400;
          throw error;
        }

        const response = await generateAnthropicLesson({
          apiKey: resolvedKey,
          baseUrl: resolvedBaseUrl,
          model: resolvedModel,
          prompt,
          maxOutputTokens: body.maxOutputTokens || maxOutputTokens,
          generationTimeoutMs: resolvedGenerationTimeoutMs,
          structuredOutputs: resolvedStructuredOutputs,
          fetchImpl,
        });

        const outputText = extractAnthropicOutputText(response);
        if (!outputText) {
          const error = new Error('Anthropic returned no lesson-plan text.');
          error.code = 'ANTHROPIC_EMPTY_RESPONSE';
          error.statusCode = 502;
          throw error;
        }

        sendJson(res, 200, {
          success: true,
          model: response.model || resolvedModel,
          responseId: response.id || null,
          responseIds: response.response_ids || undefined,
          outputText,
          usage: response.usage || null,
          stopReason: response.stop_reason || null,
        });
        return;
      }

      sendJson(res, 404, { success: false, error: 'Anthropic route not found.' });
    } catch (error) {
      sendJson(res, error?.statusCode || 500, {
        success: false,
        code: error?.code || 'ANTHROPIC_PROXY_ERROR',
        error: error?.message || 'Anthropic proxy request failed.',
      });
    }
  };
}

export function anthropicProxyPlugin(options = {}) {
  const handler = createAnthropicRequestHandler(options);
  return {
    name: 'kruai-anthropic-server-proxy',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}
