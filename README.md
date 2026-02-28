# Evaluate AI Code – Auth API

Sign Up and Sign In authentication API built with **Node.js**, **Express**, **JWT**, **bcrypt**, **Sequelize**, and **PostgreSQL**.

## Features

- **Sign Up**: Register with email, password, and full name. Passwords are hashed with bcrypt and stored in PostgreSQL.
- **Sign In**: Authenticate with email and password; receive a JWT for protected routes.
- **Protected route**: `GET /api/auth/me` returns the current user when a valid JWT is sent.
- Input validation: email format, password strength (length, upper/lowercase, number), required fields.
- Sensitive data (passwords, hashes) are never returned in responses.
- Structured error responses for invalid credentials, duplicate email, and server errors.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Auth**: JWT (jsonwebtoken)
- **Password hashing**: bcrypt
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Env**: dotenv

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. PostgreSQL

Create a database (e.g. `auth_db`) and ensure the server is running.

### 3. Environment variables

Copy the example env and set your values:

```bash
cp .env.example .env
```

Edit `.env`:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` – PostgreSQL connection
- `JWT_SECRET` – secret used to sign JWTs (use a strong value in production)
- `JWT_EXPIRES_IN` – optional, e.g. `7d` (default)
- `PORT` – optional, default `3000`

### 4. Run the server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The API will be at `http://localhost:3000` (or your `PORT`). Tables are created/updated via Sequelize `sync` on startup.

## API Reference

Base URL: `http://localhost:3000` (or your `PORT`).

### Health

- **GET** `/health` – Returns `{ status: "ok", timestamp }`.

### Sign Up

- **POST** `/api/auth/signup`  
  **Body (JSON):** `{ "email": "...", "password": "...", "fullName": "..." }`  
  **Success (201):** `{ success: true, message, data: { user, token, expiresIn } }`  
  **Errors:**  
  - `400` – Validation failed (invalid email, weak password, missing fields).  
  - `409` – Email already registered.

**Password rules:** at least 8 characters, one uppercase, one lowercase, one number.

### Sign In

- **POST** `/api/auth/signin`  
  **Body (JSON):** `{ "email": "...", "password": "..." }`  
  **Success (200):** `{ success: true, message, data: { user, token, expiresIn } }`  
  **Errors:**  
  - `400` – Validation failed (e.g. missing email/password).  
  - `401` – Invalid email or password.

### Current user (protected)

- **GET** `/api/auth/me`  
  **Header:** `Authorization: Bearer <token>`  
  **Success (200):** `{ success: true, data: { user } }`  
  **Errors:**  
  - `401` – No token, invalid token, or expired token.

`user` in responses never includes `password` or `passwordHash`.

## Tests

Unit and integration tests use Node’s built-in test runner and Supertest.

**Prerequisites:**  
- Test DB (e.g. set `DB_NAME_TEST=auth_db_test` in `.env` or use the same DB; tests use `sync({ force: true })` and will wipe the table).

Run all tests:

```bash
npm test
```

- **Unit:** `tests/validate.test.js` – email regex and password strength.  
- **Integration:** `tests/auth.test.js` – signup, signin, duplicate email, validation errors, invalid login, and `GET /api/auth/me` with and without token.

## Project structure

```
src/
  config/     – DB config (Sequelize)
  models/     – User model and Sequelize instance
  middleware/ – validate (signup/signin), auth (JWT)
  controllers/– authController (signup, signin, getMe)
  routes/     – auth routes
  app.js      – Express app and error handler
  server.js   – DB connect, sync, listen
tests/
  setup.js    – NODE_ENV=test, JWT_SECRET
  validate.test.js
  auth.test.js
```

## Security notes

- Passwords are hashed with bcrypt (salt rounds 10) and never returned.
- JWTs are signed with `JWT_SECRET`; keep this secret and use a strong value in production.
- Use HTTPS in production and secure cookies if you store the token in a browser.
