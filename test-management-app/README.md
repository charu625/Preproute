# Preproute — Test Management Application

A 5-page React application for creating, managing, and publishing MCQ tests. Built for the Preproute Frontend Developer evaluation task.

## Live Demo

Deploy to Vercel/Netlify and add the URL here before submission.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 19 + TypeScript | Required by task; type-safe API contracts |
| Build tool | Vite | Fast HMR and production builds |
| Routing | React Router v7 | Clean 5-page flow with protected routes |
| State | Zustand | Lightweight auth + question draft state without boilerplate |
| HTTP | Axios | Interceptors for JWT and 401 handling |
| Forms | React Hook Form + Zod | Performant forms with schema validation |
| Styling | Tailwind CSS v4 | Responsive utility-first layout aligned with Figma |

## Getting Started

```bash
cd test-management-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment

API calls use the relative path `/api` to avoid **CORS** errors in the browser:

- **Development:** Vite proxies `/api` → Railway backend (`vite.config.ts`)
- **Production (Vercel):** `vercel.json` rewrites `/api` to the backend
- **Production (Netlify):** `public/_redirects` proxies `/api`

Copy `.env.example` to `.env` — keep `VITE_API_BASE_URL=/api`.

After changing env or `vite.config.ts`, **restart** the dev server (`Ctrl+C`, then `npm run dev`).

**Login or proxy errors?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

### Test Credentials

- **User ID:** `vedant-admin`
- **Password:** `vedant123`

## Application Flow

1. **Login** (`/login`) — JWT stored in localStorage via Zustand persist
2. **Dashboard** (`/dashboard`) — List tests with search, edit, and preview actions
3. **Create/Edit Test** (`/tests/new`, `/tests/:id/edit`) — Cascading subject → topics → sub-topics
4. **Add Questions** (`/tests/:id/questions`) — MCQ builder with bulk API save
5. **Preview & Publish** (`/tests/:id/preview`) — Review and set `status: live`

## Project Structure

```
src/
├── api/           # Axios client + endpoint modules
├── components/    # Reusable UI and layout
├── pages/         # Route-level screens (5 pages)
├── store/         # Zustand stores
├── types/         # Shared TypeScript interfaces
└── utils/         # Formatting and error helpers
```

## API Integration

All authenticated requests send `Authorization: Bearer <token>`.

Key endpoints used:

- `POST /auth/login`
- `GET /subjects`, `/topics/subject/:id`, `POST /sub-topics/multi-topics`
- `GET|POST|PUT /tests`
- `POST /questions/bulk`, `POST /questions/fetchBulk`

The backend returns `{ status: "success", data, message }` (not `success: boolean`).

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Deployment (Vercel)

1. Push this folder to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Set environment variable `VITE_API_BASE_URL`
4. Build command: `npm run build`, output: `dist`

## Technical Decisions Summary

- **Zustand over Redux** — Minimal global state (auth token, pending questions); avoids Redux ceremony for a focused CRUD app.
- **Centralized API layer** — Each resource in `src/api/` keeps pages thin and testable.
- **Pending questions in store** — Questions are batched via `/questions/bulk` on "Save & Continue" to reduce API calls.
- **Multi-topic sub-topics** — Uses `POST /sub-topics/multi-topics` when multiple topics are selected (per API doc).
- **Protected routes** — Unauthenticated users redirect to login; 401 responses clear session automatically.

## Figma

Design reference: [Preproute Figma](https://www.figma.com/design/Ij7iKSIRH8berG6BJpU5Hh/Preproute?node-id=0-1)

UI uses Preproute-inspired indigo primary palette. Refine spacing and components against Figma before final submission.

## License

Private — submission for Preproute evaluation only.
