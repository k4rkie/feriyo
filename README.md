# Feriyo

Feriyo is a second-hand marketplace platform where users can list, browse, and purchase used items.

The goal is to build a simple, reliable platform that makes buying and selling second-hand goods easy and transparent.

🚧This project is currently a work in progress.

---

## Features

- User registration and authentication
- Create, edit, and delete listings
- Browse listings
- View individual product details
- Basic validation and API structure

---

## Tech Stack

### Backend:

- Node.js
- TypeScript
- Express
- PostgreSQL
- Drizzle ORM
- JWT authentication
- Zod validation

### Frontend:

- React
- TypeScript
- Tailwind CSS

---

## Running the project

### 1. Clone the repository

```bash
git clone git@github.com:k4rkie/feriyo.git
cd feriyo
```

### Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
DATABASE_URL=your_database_url
```

Run the necessary migrations and 

```bash
npm run dev
```

### Setup Frontend

```bash
cd client
npm install
npm run dev
```


