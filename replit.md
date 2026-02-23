# FocusMind - Mental Wellness Tracker

## Overview

FocusMind is a mental wellness tracking application that helps users monitor their mood, sleep, and stress levels through daily check-ins. It provides AI-powered analysis of wellness data, data visualization through charts, grounding tools (breathing exercises, meditation timer, 5-4-3-2-1 technique), and a full check-in history journal. The app features a dark-themed, glassmorphism UI design with purple/violet accent colors.

The project is a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for data storage. It integrates with Replit Auth for authentication and OpenAI (via Replit AI Integrations) for AI features including check-in analysis and chat conversations.

## Recent Changes

- Added exercise completion tracking system (exercise_completions table, API routes, frontend hook)
- All 7 grounding tools now record completions when finished (breathing, grounding, meditation, box_breathing, body_scan, gratitude, nature)
- Dashboard redesigned with interactive calendar showing usage days, exercise scores per day, and color-coded intensity
- Dashboard shows Active Days, Exercises Done, Perfect Days stats
- Calendar day detail panel shows which of the 7 exercises were completed + check-in data
- Removed unnecessary dashboard sections (recent check-ins list, quick actions, averages panel) in favor of calendar view
- Added personalized AI Chat feature with user-scoped conversations, streaming SSE responses, and system prompts built from user profile + recent check-ins
- Conversations table now has userId field for per-user data isolation
- Chat routes under /api/chat/* enforce authentication and user scoping
- Converted top navbar to Shadcn sidebar navigation for authenticated pages (Dashboard, Grounding, History, Chat)
- Marketing pages retain original top Navbar; authenticated pages use sidebar layout with SidebarProvider
- App.tsx separates authenticated vs marketing routes with different layout wrappers
- Added moodGoal, sleepGoal, stressGoal fields to userProfiles table (defaults: 7, 8, 3)
- Signup step 2 now includes goal-setting with +/- controls, auto-suggests based on stress/sleep answers
- Tracking page has circular progress rings for mood/sleep/stress vs goals, plus overall progress ring
- Today's progress calculates from exercises completed + mood/sleep/stress goal achievement
- PATCH /api/profile endpoint with Zod validation for updating user goals
- Date navigator restricted to current month (1st to today)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with CSS variables for theming, dark mode by default
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, stored in `client/src/components/ui/`
- **Custom Components**: Glass-card effects using framer-motion, Recharts for data visualization (mood/stress trends)
- **Build Tool**: Vite with React plugin
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Pages
- **Landing** (`/`) - Hero section with meditation image, features, dashboard preview, CTA (shown when not logged in)
- **Dashboard** (`/`, `/dashboard`) - Daily check-in dialog, mood trend chart, recent activity, AI insights card, stats
- **Grounding Tools** (`/tools`) - 4-7-8 breathing exercise, 5-4-3-2-1 senses technique, meditation timer
- **AI Chat** (`/chat`) - Personalized AI wellness companion with streaming responses, conversation history, user-scoped data
- **History** (`/history`) - Full check-in journal, expandable cards with AI analysis, weekly bar chart, overall stats
- **Features** (`/features`) - Feature cards for all platform capabilities
- **About** (`/about`) - Mission, approach, community info, company story
- **Pricing** (`/pricing`) - Free/Pro/Team plan comparison
- **Download** (`/download`) - Web/Mobile/Desktop platform availability
- **Help Centre** (`/help`) - Searchable help categories with article links
- **Contact** (`/contact`) - Contact info cards + message form
- **Status** (`/status`) - System status for all services
- **FAQ** (`/faq`) - Expandable FAQ accordion
- **Blog** (`/blog`) - Blog post cards with categories
- **Wellbeing Tips** (`/wellbeing-tips`) - Wellness tips with icons
- **Press** (`/press`) - Press coverage and media enquiries
- **Careers** (`/careers`) - Open positions with job cards
- **Privacy Policy** (`/privacy`) - Full privacy policy
- **Terms of Use** (`/terms`) - Terms of service
- **Cookies** (`/cookies`) - Cookie policy

### Shared Layout Components
- **Footer** (`components/layout/Footer.tsx`) - Reusable footer with newsletter, social links, and navigation columns
- **InfoPageLayout** (`components/layout/InfoPageLayout.tsx`) - Shared layout wrapper (Navbar + Footer) for all informational pages

### Backend (Server)
- **Framework**: Express.js running on Node.js with TypeScript (via tsx)
- **Entry Point**: `server/index.ts` creates HTTP server, registers routes, serves static files in production or uses Vite dev server in development
- **API Structure**: REST API under `/api/` prefix, route definitions shared between client and server via `shared/routes.ts`
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js, session stored in PostgreSQL via `connect-pg-simple`
- **AI Integration**: OpenAI SDK configured with Replit AI Integrations environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)

### Shared Code (`shared/`)
- **Schema**: Drizzle ORM table definitions in `shared/schema.ts` and `shared/models/`
- **Routes**: Type-safe API route definitions with Zod validation in `shared/routes.ts`
- **Models**: Separate model files for auth (`models/auth.ts`) and chat (`models/chat.ts`)

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: `node-postgres` (pg) Pool, configured via `DATABASE_URL` environment variable
- **Schema Push**: Use `npm run db:push` (drizzle-kit push) to sync schema to database
- **Tables**:
  - `users` - User profiles (required for Replit Auth)
  - `sessions` - Session storage (required for Replit Auth)
  - `checkins` - Daily wellness check-ins (mood_score, sleep_hours, stress_level, notes)
  - `conversations` - AI chat conversations
  - `messages` - Individual chat messages within conversations

### Replit Integrations (`server/replit_integrations/`)
Pre-built integration modules that should not be modified unless necessary:
- **auth/**: Replit Auth setup with OpenID Connect, session management, user upsert
- **chat/**: AI chat with conversation/message CRUD and streaming responses
- **audio/**: Voice chat with speech-to-text, text-to-speech, and audio streaming
- **image/**: Image generation via gpt-image-1
- **batch/**: Batch processing utilities with rate limiting and retries

### Build Process
- **Development**: `npm run dev` runs tsx with Vite dev server (HMR enabled)
- **Production Build**: `npm run build` runs `script/build.ts` which builds client with Vite and bundles server with esbuild
- **Production Start**: `npm run start` runs the built `dist/index.cjs`

### Static Site
There is a separate static HTML/CSS/JS site in `static/` (served by `server.js`) that appears to be a landing page. This is independent of the main React application.

### Key API Routes
- `GET /api/auth/user` - Get current authenticated user
- `GET /api/login` - Initiate Replit Auth login
- `GET /api/logout` - Logout
- `GET /api/checkins` - List user's check-ins
- `POST /api/checkins` - Create a new check-in
- `POST /api/ai/analyze` - AI analysis of a check-in
- `GET/POST/DELETE /api/conversations` - Chat conversation CRUD
- `POST /api/conversations/:id/messages` - Send chat message (streaming response)

## External Dependencies

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (must be provisioned)
- `SESSION_SECRET` - Secret for Express session encryption
- `REPL_ID` - Replit environment identifier (auto-set on Replit)
- `ISSUER_URL` - OpenID Connect issuer URL (defaults to `https://replit.com/oidc`)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - API key for OpenAI via Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Base URL for OpenAI API proxy

### Third-Party Services
- **PostgreSQL**: Primary database for all data storage (users, sessions, check-ins, conversations, messages)
- **Replit Auth**: Authentication via OpenID Connect protocol
- **OpenAI API** (via Replit AI Integrations): Powers AI check-in analysis, chat conversations, image generation, and voice features
- **Google Fonts**: Outfit, Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter, Playfair Display font families

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` + `drizzle-zod` - Database ORM, migrations, and schema validation
- `express` + `express-session` - HTTP server and session management
- `passport` + `openid-client` - Authentication
- `openai` - AI API client
- `@tanstack/react-query` - Client-side data fetching and caching
- `recharts` - Data visualization charts
- `framer-motion` - UI animations
- `zod` - Runtime type validation (shared between client and server)
- `wouter` - Client-side routing
- `shadcn/ui` ecosystem - Radix UI, class-variance-authority, tailwind-merge, clsx
