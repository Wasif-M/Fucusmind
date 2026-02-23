# FocusMind - Complete Setup & Run Guide

A mental wellness tracking application built with React, Express, TypeScript, and PostgreSQL.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Build for Production](#build-for-production)
7. [Project Structure](#project-structure)
8. [API Endpoints](#api-endpoints)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

| Tool | Version | Download Link |
|------|---------|---------------|
| Node.js | v18.x or higher | [nodejs.org](https://nodejs.org/) |
| npm | v9.x or higher | Comes with Node.js |
| PostgreSQL | v14.x or higher | [postgresql.org](https://www.postgresql.org/download/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Verify Installation

```bash
node --version    # Should output v18.x.x or higher
npm --version     # Should output 9.x.x or higher
psql --version    # Should output psql 14.x or higher
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Code-Builder
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- **Frontend**: React, Vite, TailwindCSS, Radix UI, TanStack Query
- **Backend**: Express, Passport, Drizzle ORM
- **AI Integration**: OpenAI SDK
- **Database**: PostgreSQL driver (node-postgres)

---

## Environment Variables

### 1. Create Environment File

Create a `.env` file in the root directory:

```bash
# Windows (PowerShell)
New-Item -Path ".env" -ItemType File

# Linux/macOS
touch .env
```

### 2. Configure Environment Variables

Add the following variables to your `.env` file:

```env
# ==============================
# DATABASE CONFIGURATION
# ==============================
DATABASE_URL=postgresql://username:password@localhost:5432/focusmind

# ==============================
# SESSION CONFIGURATION
# ==============================
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters

# ==============================
# SERVER CONFIGURATION
# ==============================
PORT=5000
NODE_ENV=development

# ==============================
# AI INTEGRATION (OpenAI)
# ==============================
# Required for AI-powered features (chat, analysis, image generation)
AI_INTEGRATIONS_OPENAI_API_KEY=your-openai-api-key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# ==============================
# AUTHENTICATION (Optional - Replit Auth)
# ==============================
# Only needed if using Replit Auth
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
```

### Environment Variable Details

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ Yes | Secret key for session encryption (min 32 chars) |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment mode: `development` or `production` |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | ✅ Yes | OpenAI API key for AI features |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | No | OpenAI API base URL |
| `REPL_ID` | No | Replit environment ID (for Replit Auth) |
| `ISSUER_URL` | No | OpenID Connect issuer URL |

---

## Database Setup

### 1. Install PostgreSQL

#### Windows
Download and install from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

#### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

Connect to PostgreSQL and create the database:

```bash
# Connect as postgres superuser
psql -U postgres

# Or on Linux
sudo -u postgres psql
```

Run the following SQL commands:

```sql
-- Create a new user (replace 'your_password' with a secure password)
CREATE USER focusmind_user WITH PASSWORD 'your_password';

-- Create the database
CREATE DATABASE focusmind OWNER focusmind_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE focusmind TO focusmind_user;

-- Connect to the database
\c focusmind

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO focusmind_user;

-- Exit psql
\q
```

### 3. Update DATABASE_URL

Update the `DATABASE_URL` in your `.env` file:

```env
DATABASE_URL=postgresql://focusmind_user:your_password@localhost:5432/focusmind
```

### 4. Push Database Schema

Run the following command to create all database tables:

```bash
npm run db:push
```

This uses Drizzle Kit to push the schema defined in `shared/schema.ts` to your PostgreSQL database.

### Database Tables Created

| Table | Description |
|-------|-------------|
| `users` | User accounts (required for authentication) |
| `sessions` | Session storage for authentication |
| `user_profiles` | Extended user profile information |
| `checkins` | Daily wellness check-ins (mood, sleep, stress) |
| `conversations` | AI chat conversations |
| `messages` | Chat messages within conversations |
| `exercise_completions` | Completed wellness exercises |
| `exercise_favorites` | User's favorite exercises |
| `exercise_settings` | Exercise customization settings |
| `exercise_sessions` | Session duration tracking |
| `saved_responses` | Saved AI chat responses |
| `user_goals` | User wellness goals |

### Verify Database Connection

```bash
# Connect to verify tables were created
psql -U focusmind_user -d focusmind -c "\dt"
```

---

## Running the Application

### Development Mode

Start the development server with hot module reloading:

```bash
npm run dev
```

The application will be available at:
- **URL**: http://localhost:5000
- **Features**: Hot reload, Vite dev server, API proxy

### What happens in development:
1. Express server starts on port 5000
2. Vite dev server provides HMR for React frontend
3. API routes are registered under `/api/`
4. Database connection is established

---

## Build for Production

### 1. Build the Application

```bash
npm run build
```

This command:
- Builds the React frontend with Vite → `dist/public/`
- Bundles the Express server with esbuild → `dist/index.cjs`

### 2. Start Production Server

```bash
npm run start
```

Or with explicit production mode:

```bash
# Windows (PowerShell)
$env:NODE_ENV="production"; node dist/index.cjs

# Linux/macOS
NODE_ENV=production node dist/index.cjs
```

### 3. Type Checking

Run TypeScript type checking:

```bash
npm run check
```

---

## Project Structure

```
Code-Builder/
├── client/                     # React Frontend
│   ├── index.html              # HTML entry point
│   ├── public/                 # Static assets
│   └── src/
│       ├── App.tsx             # Main React component
│       ├── main.tsx            # React entry point
│       ├── index.css           # Global styles
│       ├── components/         # React components
│       │   ├── ui/             # shadcn/ui components
│       │   ├── layout/         # Layout components (Navbar, Footer)
│       │   ├── dashboard/      # Dashboard-specific components
│       │   └── charts/         # Data visualization components
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utility functions
│       └── pages/              # Page components
│
├── server/                     # Express Backend
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # API route definitions
│   ├── db.ts                   # Database connection
│   ├── storage.ts              # Data access layer
│   ├── static.ts               # Static file serving
│   ├── vite.ts                 # Vite integration for development
│   └── replit_integrations/    # Pre-built integrations
│       ├── auth/               # Authentication module
│       ├── chat/               # AI chat module
│       ├── audio/              # Voice/audio features
│       ├── image/              # Image generation
│       └── batch/              # Batch processing utilities
│
├── shared/                     # Shared Code (Client & Server)
│   ├── schema.ts               # Drizzle ORM table definitions
│   ├── routes.ts               # Type-safe API route definitions
│   └── models/
│       ├── auth.ts             # Auth-related models
│       └── chat.ts             # Chat-related models
│
├── script/
│   └── build.ts                # Production build script
│
├── drizzle.config.ts           # Drizzle ORM configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── .env                        # Environment variables (create this)
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/user` | Get current authenticated user |
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login with credentials |
| GET | `/api/logout` | Logout current user |

### Check-ins

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/checkins` | Get user's check-ins |
| POST | `/api/checkins` | Create new check-in |

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze` | AI analysis of check-in |
| GET | `/api/conversations` | List conversations |
| POST | `/api/conversations` | Create conversation |
| DELETE | `/api/conversations/:id` | Delete conversation |
| POST | `/api/conversations/:id/messages` | Send message (streaming) |

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| PATCH | `/api/profile` | Update user profile |

### Exercises

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exercises/complete` | Record exercise completion |
| GET | `/api/exercises/completions` | Get exercise completions |

---

## Troubleshooting

### Database Connection Issues

**Error: `DATABASE_URL must be set`**
- Ensure `.env` file exists in the root directory
- Verify `DATABASE_URL` is correctly formatted
- Restart the server after updating `.env`

**Error: `Connection refused`**
```bash
# Check if PostgreSQL is running
# Windows
Get-Service -Name postgresql*

# Linux
sudo systemctl status postgresql

# macOS
brew services list | grep postgresql
```

**Error: `Authentication failed`**
- Verify username and password in `DATABASE_URL`
- Check PostgreSQL user permissions:
  ```sql
  \du  -- List users and roles
  ```

### Port Already in Use

**Error: `EADDRINUSE: address already in use :::5000`**

```bash
# Windows (PowerShell) - Find and kill process
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
Stop-Process -Id <PID>

# Linux/macOS
lsof -i :5000
kill -9 <PID>
```

Or use a different port:
```env
PORT=3000
```

### Schema Push Fails

**Error: `relation already exists`**
- This is usually safe to ignore if tables exist
- To reset database:
  ```sql
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO focusmind_user;
  ```
- Then run `npm run db:push` again

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors

```bash
# Run type checking
npm run check

# If persistent, regenerate types
npm run db:push
```

---

## Additional Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push schema to database |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| UI Components | shadcn/ui, Radix UI, Framer Motion |
| State Management | TanStack React Query |
| Routing | Wouter |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL with Drizzle ORM |
| Authentication | Passport.js (Local + Replit Auth) |
| AI | OpenAI API |
| Charts | Recharts |

---

## Support

If you encounter any issues not covered in this guide:
1. Check existing GitHub issues
2. Create a new issue with detailed error logs
3. Include your environment (OS, Node version, PostgreSQL version)
