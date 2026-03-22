# CalorieTrack

CalorieTrack is a responsive Next.js calorie and nutrition behavior app that combines calorie logging, macro tracking, satiety analysis, mood and sleep context, saved meals, weekly insights, and smart meal suggestions.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Auth.js / NextAuth
- MongoDB Atlas + Mongoose
- React Hook Form + Zod
- TanStack Query
- Framer Motion ready structure
- Recharts

## Features included in this scaffold

- Landing, auth, onboarding, dashboard, meals, history, saved meals, insights, progress, profile, settings, and dev utility pages
- Theme support
- Shared app shell with desktop sidebar and mobile bottom nav
- Mongoose models and API route scaffolding
- USDA-ready food service layer with mock fallback
- Rule-based dashboard and insight services
- Demo-safe fallback data for local UI work before env setup

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
USDA_API_KEY=
JWT_SECRET=
GEMINI_API_KEY=
```

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Important notes

- Google auth route scaffolding is present. Add real Google OAuth credentials to fully enable sign-in.
- MongoDB connection helper and Mongoose models are included. Add `MONGODB_URI` to switch from demo-safe mode to database-backed mode.
- USDA search is designed behind a service layer so Nutritionix, Edamam, or Spoonacular can be added later without rewriting the UI.

## Recommended next steps

1. Wire real Auth.js sign-in/sign-out button flows.
2. Persist meals, saved meals, and profile updates to MongoDB.
3. Add rate limiting and ownership checks to write routes.
4. Add test coverage for calculations, validators, and insight rules.
5. Polish optimistic mutations and loading skeletons on data-entry pages.
