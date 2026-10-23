<div align="center">
  <img src="./apps/web/public/feriyo.svg" alt="Feriyo Logo" width="150" height="auto" />
  <p><strong>Feriyo is a place where people buy and sell second-hand stuff.</strong></p>
</div>

## What can you do on Feriyo?

- **Sign up and log in** — passwords are scrambled before being stored (using bcrypt), so the real password never touches the database. Once you log in, you stay logged in.
- **Sell something** — post a listing with up to 5 photos, a title, a description, a price, a category (electronics, fashion, furniture, vehicles…), the condition it's in, and your location.
- **Shop around** — browse everything for sale, search by keyword, filter by category, and page through the results.
- **Save items for later** — bookmark listings you like so you can find them again.
- **Chat with the other person** — every listing gets its own conversation between buyer and seller, and messages appear instantly without refreshing the page.
- **Haggle** — buyers can send a price offer inside the chat. The seller can accept or reject it. Offers expire after a while, and only one open offer can exist in a conversation at a time.
- **Have a profile** — every user gets a public page with their avatar and their listings.

> [!NOTE]  
> This started as an early learning project and has since been cleaned up and hardened.

---

## Built with

| Part | What I used | What it does (in plain words) |
| --- | --- | --- |
| Website | React, TypeScript, Tailwind CSS | The pages, and making them look decent |
| Server | Node.js, Express, TypeScript | Answers the browser's requests |
| Database | PostgreSQL, Drizzle | Stores everything; Drizzle lets me talk to the database in TypeScript instead of raw SQL |
| Live chat | Socket.IO | Makes messages show up instantly |
| Staying logged in | JWT (access + refresh tokens) | Proves who you are on each request, without logging in again every hour |
| Input checking | Zod | Rejects badly-shaped data before it can reach the database |
| Photo uploads | Multer + Cloudinary | Receives listing photos from the browser and stores them in Cloudinary |

This is a **pnpm monorepo** with three packages:

```
feriyo/
├── apps/
│   ├── web/            @feriyo/web   — React (Vite) frontend
│   └── api/            @feriyo/api   — Express backend
├── packages/
│   └── shared/         @feriyo/shared — Zod validation schemas (used by both web & api)
├── pnpm-workspace.yaml
├── docker-compose.yml  — PostgreSQL
└── .env.example        — copy to .env, same for apps/api and apps/web
```

The `shared/` package holds the input-checking rules (Zod), so the browser and the server always agree on what valid data looks like.

---

## Running it locally

Need Node.js 18+ and pnpm.

**1. Clone**

```bash
git clone git@github.com:k4rkie/feriyo.git
cd feriyo
```

**2. Env files**

Copy each `.env.example` to `.env` and fill the values:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

- `.env` — Postgres user/password/db for docker-compose
- `apps/api/.env` — PORT, DATABASE_URL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, FRONTEND_URL, CLOUDINARY_URL (required for uploads)
- `apps/web/.env` — VITE_BASE_BACKEND_URL (point to the api, e.g. `http://localhost:8000`)

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**3. Start the database**

```bash
docker compose up -d
```

**4. Install deps**

```bash
pnpm install
```

**5. Create tables**

```bash
pnpm migrate
```

Optional seed:

```bash
pnpm seed
```

**6. Run**

```bash
pnpm dev
```

Web: `http://localhost:3000`
API: `http://localhost:8000`

