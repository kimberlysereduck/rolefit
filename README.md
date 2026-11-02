# RoleFit

RoleFit compares a resume with a job description to help identify match strength,
keyword coverage, and missing requirements. It can also generate a tailored
resume and cover letter, with export options for PDF and Google Docs.

## Requirements

- [Bun](https://bun.sh/) 1.4 or newer
- Node.js 22 or newer
- A Gemini API key for AI-powered analysis and document generation

## Getting started

```sh
bun install
cp .env.example .env
```

Set `GEMINI_API_KEY` and `VITE_FIREBASE_API_KEY` in `.env`. The non-secret
Firebase project settings are in `firebase-applet-config.json`; the web API key
is provided separately through the environment. Configure Firebase
Authentication and the required Google API scopes for sign-in and Google Docs
export.

`VITE_FIREBASE_API_KEY` is bundled into the browser app and is visible to users
of the deployed site. Firebase web API keys identify a project; they are not
server secrets. Restrict the key in Google Cloud/Firebase to the APIs and
websites your app needs. Never put `GEMINI_API_KEY` in a `VITE_` variable or
other frontend configuration. For a hosted frontend, provide
`VITE_FIREBASE_API_KEY` to the build environment (for example, as a GitHub
Actions secret) rather than committing its value.

Start the app in development mode:

```sh
bun run dev
```

The development server is available at <http://localhost:3000>. To make a
production build, run `bun run build`; `bun run start` starts the server in
production mode.

## Checks

```sh
bun run lint           # Biome lint and TypeScript type-check
bun run test           # Run the test suite
bun run test:coverage  # Run tests and report utility-module coverage
bun run build          # Build the production client
```

Coverage is currently collected for `src/utils/keywordAnalysis.ts`, which
contains the tested resume/job-description matching calculations. Vitest writes
HTML and LCOV reports to `coverage/`.

GitHub Actions runs linting, tests with coverage, and the production build on
every push to `main` and every pull request.
