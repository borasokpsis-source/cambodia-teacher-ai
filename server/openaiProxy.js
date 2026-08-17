const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5.6-terra';
const DEFAULT_MAX_OUTPUT_TOKENS = 12000;
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

export function extractOpenAIOutputText(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }

  return (response?.output || [])
    .flatMap((item) => item?.content || [])
    .filter((content) => content?.type === 'output_text' && typeof content.text === 'string')
    .map((content) => content.text)
    .join('\n')
    .trim();
}

function normalizeModel(model) {
  return typeof model === 'string' && model.trim() ? model.trim() : DEFAULT_MODEL;
}

function normalizeMaxOutputTokens(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_MAX_OUTPUT_TOKENS;
  return Math.min(20000, Math.max(1000, Math.round(parsed)));
}

export async function requestOpenAI({
  apiKey,
  model = DEFAULT_MODEL,
  payload,
  fetchImpl = globalThis.fetch,
  timeoutMs = 120000,
}) {
  if (!apiKey) {
    const error = new Error('OpenAI is not configured on the server.');
    error.code = 'OPENAI_NOT_CONFIGURED';
    error.statusCode = 503;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: normalizeModel(model), store: false, ...payload }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || `OpenAI request failed with HTTP ${response.status}.`);
      error.code = data?.error?.code || 'OPENAI_REQUEST_FAILED';
      error.statusCode = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('OpenAI request timed out.');
      timeoutError.code = 'OPENAI_TIMEOUT';
      timeoutError.statusCode = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function createOpenAIRequestHandler({
  apiKey = '',
  model = DEFAULT_MODEL,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
  fetchImpl = globalThis.fetch,
} = {}) {
  const resolvedKey = typeof apiKey === 'string' ? apiKey.trim() : '';
  const resolvedModel = normalizeModel(model);

  return async function openAIRequestHandler(req, res, next) {
    const url = new URL(req.url || '/', 'http://localhost');
    if (!url.pathname.startsWith('/api/openai/')) {
      next();
      return;
    }

    try {
      if (req.method === 'GET' && url.pathname === '/api/openai/status') {
        sendJson(res, 200, {
          provider: 'openai',
          configured: Boolean(resolvedKey),
          model: resolvedModel,
          keyLocation: 'server-environment',
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/openai/test') {
        const response = await requestOpenAI({
          apiKey: resolvedKey,
          model: resolvedModel,
          fetchImpl,
          timeoutMs: 30000,
          payload: {
            instructions: 'This is a connection test. Reply with exactly OPENAI_OK.',
            input: 'Connection test',
            max_output_tokens: 32,
          },
        });

        sendJson(res, 200, {
          success: true,
          configured: true,
          model: response.model || resolvedModel,
          responseId: response.id || null,
          outputText: extractOpenAIOutputText(response),
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/openai/generate') {
        const body = await readJsonBody(req);
        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
        if (prompt.length < 40) {
          const error = new Error('A complete lesson-plan prompt is required.');
          error.statusCode = 400;
          throw error;
        }

        const response = await requestOpenAI({
          apiKey: resolvedKey,
          model: resolvedModel,
          fetchImpl,
          payload: {
            instructions:
              'You are an expert Cambodian curriculum lesson-plan writer. Return only one valid JSON object in Khmer Unicode. Do not include Markdown fences or commentary.',
            input: prompt,
            max_output_tokens: normalizeMaxOutputTokens(body.maxOutputTokens || maxOutputTokens),
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

        sendJson(res, 200, {
          success: true,
          model: response.model || resolvedModel,
          responseId: response.id || null,
          outputText,
          usage: response.usage || null,
        });
        return;
      }

      sendJson(res, 404, { success: false, error: 'OpenAI route not found.' });
    } catch (error) {
      sendJson(res, error?.statusCode || 500, {
        success: false,
        code: error?.code || 'OPENAI_PROXY_ERROR',
        error: error?.message || 'OpenAI proxy request failed.',
      });
    }
  };
}

export function openAIProxyPlugin(options = {}) {
  const handler = createOpenAIRequestHandler(options);
  return {
    name: 'kruai-openai-server-proxy',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

