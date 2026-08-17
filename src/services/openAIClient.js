const OPENAI_STATUS_URL = '/api/openai/status';
const OPENAI_TEST_URL = '/api/openai/test';
const OPENAI_GENERATE_URL = '/api/openai/generate';

async function readJsonResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `OpenAI server returned HTTP ${response.status}.`);
    error.code = data.code || 'OPENAI_CLIENT_ERROR';
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function getOpenAIStatus() {
  try {
    const response = await fetch(OPENAI_STATUS_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    return await readJsonResponse(response);
  } catch (error) {
    return {
      provider: 'openai',
      configured: false,
      model: null,
      unavailable: true,
      error: error.message,
    };
  }
}

export async function testOpenAIConnection() {
  const response = await fetch(OPENAI_TEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return readJsonResponse(response);
}

export async function generateOpenAIJson(prompt, { maxOutputTokens = 12000 } = {}) {
  const response = await fetch(OPENAI_GENERATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, maxOutputTokens }),
  });
  return readJsonResponse(response);
}

