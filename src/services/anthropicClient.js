const ANTHROPIC_STATUS_URL = '/api/anthropic/status';
const ANTHROPIC_TEST_URL = '/api/anthropic/test';
const ANTHROPIC_GENERATE_URL = '/api/anthropic/generate';

async function readJsonResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Anthropic server returned HTTP ${response.status}.`);
    error.code = data.code || 'ANTHROPIC_CLIENT_ERROR';
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function getAnthropicStatus() {
  try {
    const response = await fetch(ANTHROPIC_STATUS_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    return await readJsonResponse(response);
  } catch (error) {
    return {
      provider: 'anthropic',
      configured: false,
      model: null,
      unavailable: true,
      error: error.message,
    };
  }
}

export async function testAnthropicConnection() {
  const response = await fetch(ANTHROPIC_TEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return readJsonResponse(response);
}

export async function generateAnthropicJson(prompt, { maxOutputTokens = 16000 } = {}) {
  const response = await fetch(ANTHROPIC_GENERATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, maxOutputTokens }),
  });
  return readJsonResponse(response);
}
