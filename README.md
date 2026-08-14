# Kognitribe Global Solutions — AI Lead Generation & Outreach Platform

A MERN + Tailwind SaaS-style internal lead discovery and responsible B2B outreach platform.

## Important
This implementation follows the supplied product specification:
- public/authorized sources only
- no private-profile scraping
- no CAPTCHA/auth/rate-limit bypassing
- no guessed or fabricated emails
- AI-generated emails always enter a human review queue
- suppression/unsubscribe checks happen before sending
- sending limits are enforced server-side

Some integrations are intentionally disabled until credentials are configured. The app includes demo data so the UI can be explored immediately.

## Stack
- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Nodemailer
- AI: provider-independent OpenAI-compatible service
- Sources: RSS, GitHub API, Reddit API, generic public API adapter

## Project Structure
kognitribe-lead-platform/
  client/
  server/
  README.md

## 1. Requirements
Install:
- Node.js 20+
- MongoDB Atlas account or local MongoDB
- Git (optional)

## 2. Backend setup
Open a terminal:

cd server
npm install

Copy:
cp .env.example .env

Windows PowerShell:
Copy-Item .env.example .env

Edit `server/.env` before starting.

Required:
MONGO_URI=your MongoDB connection string
JWT_SECRET=a-long-random-secret

Optional:
AI_API_KEY=
AI_MODEL=
AI_BASE_URL=https://api.openai.com/v1

Email:
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=

Source integrations:
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
GITHUB_TOKEN=

Start backend:
npm run dev

Backend:
http://localhost:5000

Health:
http://localhost:5000/api/health

## 3. Frontend setup
Open a second terminal:

cd client
npm install
npm run dev

Frontend:
http://localhost:5173

If your frontend is running on another URL, set:
VITE_API_URL=http://localhost:5000/api

in `client/.env`.

## 4. MongoDB Atlas
1. Create a cluster.
2. Create a database user.
3. Network Access -> add your development IP (or use the appropriate restricted network rule).
4. Connect -> Drivers -> Node.js.
5. Copy the connection string.
6. Put it in `server/.env` as MONGO_URI.

Example:
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/kognitribe_leads?retryWrites=true&w=majority

Do not commit `.env`.

## 5. Create the first admin
After MongoDB is configured:

cd server
npm run seed:admin

The seed script uses:
ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
from `.env`.

Default development example in `.env.example`:
ADMIN_EMAIL=admin@kognitribe.co.in
ADMIN_PASSWORD=ChangeThisImmediately123!

Change these before using the system.

## 6. Demo data
To load demo leads, email records and sources:

cd server
npm run seed:demo

Demo records are labeled as demo data.

## 7. AI configuration
The app uses a provider-independent service. Set:

AI_API_KEY=...
AI_MODEL=...
AI_BASE_URL=https://api.openai.com/v1

The service sends a JSON-oriented prompt and safely falls back to deterministic local analysis when no key is configured. This means the platform can be explored without an AI key, but real AI generation requires a valid provider key.

Never put AI_API_KEY in the React frontend.

## 8. SMTP / email configuration
Put credentials only in `server/.env`.

Example:
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM="Kognitribe Global Solutions <contact@example.com>"

The backend will refuse sending when:
- no valid public email exists
- recipient is suppressed
- recipient has unsubscribed
- email is not human-approved
- hourly/daily/campaign limits are exceeded

For local UI testing, leave SMTP empty and use demo mode. The API will report that a real SMTP provider is not configured instead of pretending a message was sent.

## 9. GitHub
Create a GitHub token with only the minimum public-data permissions needed for your intended use.

Set:
GITHUB_TOKEN=...

The adapter searches public issues/repositories only.

## 10. Reddit
Use Reddit's permitted API access and credentials:
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

The UI lets admins configure keywords/subreddits. Respect Reddit's current API policies and rate limits.

## 11. RSS
Admins can add RSS feed URLs from the Sources page. The backend uses RSS/XML parsing and does not scrape pages behind the feed.

## 12. Generic Opportunity API
Use the Sources page to configure a public API that explicitly permits your intended use. The adapter supports GET/POST JSON responses and maps common fields to the normalized lead schema.

## 13. Main pages
Public:
- /
- /login
- /register
- /forgot-password

Authenticated:
- /dashboard
- /leads
- /leads/:id
- /email-queue
- /email-queue/:id
- /sources
- /analytics
- /settings

Admin-only:
- /settings/users
- /settings/compliance

## 14. Core workflow
Source -> normalize -> deduplicate -> AI analysis -> score -> service matching -> lead -> email draft -> human review -> approval -> backend compliance checks -> send -> analytics.

## 15. API summary
Auth:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Leads:
GET    /api/leads
GET    /api/leads/:id
POST   /api/leads
PUT    /api/leads/:id
DELETE /api/leads/:id
POST   /api/leads/:id/analyze

AI:
POST /api/ai/analyze-lead
POST /api/ai/generate-email
POST /api/ai/regenerate-email
POST /api/ai/generate-followup

Sources:
GET    /api/sources
POST   /api/sources
PUT    /api/sources/:id
DELETE /api/sources/:id
POST   /api/sources/:id/test
POST   /api/sources/:id/sync

Emails:
GET    /api/emails
GET    /api/emails/:id
PUT    /api/emails/:id
POST   /api/emails/:id/approve
POST   /api/emails/:id/send
POST   /api/emails/:id/reject
POST   /api/emails/:id/regenerate

Compliance:
GET    /api/compliance/suppression
POST   /api/compliance/suppression
DELETE /api/compliance/suppression/:id
GET    /api/compliance/unsubscribes

Analytics:
GET /api/analytics/dashboard
GET /api/analytics/leads
GET /api/analytics/emails

Settings:
GET /api/settings/company
PUT /api/settings/company
GET /api/settings/ai
PUT /api/settings/ai
GET /api/settings/email
PUT /api/settings/email
GET /api/settings/users
PUT /api/settings/users/:id/role
GET /api/settings/compliance
PUT /api/settings/compliance

## 16. Troubleshooting
### MongoDB connection error
Check MONGO_URI, username/password encoding, Atlas network access and database user.

### CORS error
Check `CLIENT_URL` in server `.env` and the URL printed by Vite.

### 401 / Not Authorized
Login again and ensure the browser cookie is accepted.

### AI not working
Check AI_API_KEY, AI_BASE_URL, AI_MODEL and server logs.

### Email not sending
Check SMTP settings. The app deliberately does not fake successful sends.

### Port already in use
Change PORT in server `.env` and VITE_API_URL in client `.env`.

## 17. Production notes
Before production:
- use HTTPS
- use secure cookies
- restrict CORS
- use a secret manager
- use a transactional email provider
- configure monitoring/logging
- configure MongoDB IP/network controls
- review source-specific API terms
- configure legal/compliance requirements for the jurisdictions and recipients you contact
- never turn off approval/compliance checks to increase volume
