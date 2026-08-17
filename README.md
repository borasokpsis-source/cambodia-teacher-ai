# KruAI Cambodia

KruAI is a React/Vite lesson-planning workspace for Cambodian teachers. MoEYS textbook lesson titles define the curriculum boundary, while traceable open educational resources can be attached as enrichment references.

## Current workflow

1. Select level, grade, subject and a MoEYS lesson title (where indexed).
2. Choose a teaching method, duration, classroom resource level and optional open resources.
3. Generate with OpenAI or Claude through secure server proxies, Gemini with a personal browser key, or the offline draft engine.
4. Review the automatic structural quality checks.
5. Save a draft or publish a CC BY 4.0 copy to the local teacher library.
6. Search, open and remix saved plans.

## Teacher-authored template

Generated plans use the `happy-chandara-v1` profile distilled from teacher-provided lesson plans, worksheets and companion slides. The reusable structure is:

1. General lesson information.
2. Knowledge, skill and attitude competencies.
3. Teaching materials.
4. Core lesson content.
5. Either a 5E activity/time table or the traditional teacher/content/student table.
6. A required separate student worksheet.
7. An optional five-slide teaching outline.

The profile stores structure only and does not redistribute the source documents or copy their lesson content. Its implementation is in `src/data/teacherTemplateProfiles.js`.

## Curriculum and sources

- `src/data/officialMoEYSTextbooks.js` contains the indexed official book/chapter/lesson titles.
- `src/data/openEducationalResources.js` contains curated resource discovery points and their licensing notes.
- A linked resource is a recommendation unless its description or teacher-provided notes are explicitly supplied to the generator. KruAI does not claim to have opened arbitrary links.
- “MoEYS aligned” describes scope alignment only. It does not mean the generated plan is approved by the Ministry.

## Local storage

The current MVP stores teacher-added resources and saved lesson plans in browser `localStorage`:

- `kruai_lesson_library_v1`
- `kruai_resource_library_v1`

This makes the workflow usable without a backend, but the library is not shared between devices or teachers yet. The storage functions are isolated in `src/services/libraryStorage.js` so they can later be replaced with a shared database service.

## Development

```bash
npm install
npm run dev
```

## Server AI local test setup

Claude Opus 5 is the default high-quality provider, and OpenAI is available as an alternative. Both API keys are read only by the Vite server and are never included in the browser bundle or saved to `localStorage`.

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and replace the placeholder:

```dotenv
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-5.6-terra
OPENAI_MAX_OUTPUT_TOKENS=12000

ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL=claude-opus-5
ANTHROPIC_MAX_OUTPUT_TOKENS=16000
ANTHROPIC_GENERATION_TIMEOUT_MS=300000
ANTHROPIC_STRUCTURED_OUTPUTS=true
```

Then restart the development server:

```bash
npm run dev
```

Open **AI settings** in KruAI and select **Test OpenAI** or **Test Claude**. Each test makes one small API request. Never put either server API key in a variable beginning with `VITE_`; Vite exposes those variables to browser code.

For an Anthropic-compatible gateway, set `ANTHROPIC_BASE_URL` to the provider's HTTPS base URL without `/v1`. Keep the official `https://api.anthropic.com` value when using a key issued directly by Anthropic.

If a compatible gateway does not support streaming together with Anthropic structured outputs, set `ANTHROPIC_STRUCTURED_OUTPUTS=false`. KruAI will continue to request the same JSON shape through its explicit prompt and validate it after generation.

The local Vite middleware provides `/api/openai/*` and `/api/anthropic/*` status, test, and generation routes. Production uses the equivalent Cloudflare Worker adapter in `worker/index.js`, configured by `wrangler.jsonc`.

Before the first Cloudflare deployment, store provider keys as Worker secrets (never as plain `vars`):

```powershell
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put OPENAI_API_KEY
npm run deploy
```

The Worker serves the Vite build as static assets and handles `/api/*` before the single-page-app fallback.

Quality checks:

```bash
npm run lint
npm run build
```

## Gemini API key note

The prototype still accepts a teacher's personal Gemini key in the browser as an optional provider. Do not deploy a shared Gemini secret through a `VITE_` environment variable because Vite embeds those values in client assets. Shared provider keys belong behind server-side endpoints.
