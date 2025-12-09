# SmartURL – URL Shortener (Node/Express + MySQL)

A full‑stack URL shortener with user authentication, a user dashboard, an admin panel, and a clean dark UI. Guests can shorten URLs; logged‑in users get management tools and favorites. Admins can view users, URLs, and global stats.

## Features
- Shorten URLs (guest or authenticated), optional custom alias
- User auth: register/login (bcrypt + JWT)
- Dashboard: list URLs, click counts, delete, mark as favorite
- Favorites filter and star toggle in dashboard
- Admin panel: list/delete users and URLs, global stats
- Professional dark theme and aligned header navigation

## Tech Stack
- Backend: Node.js, Express 5, MySQL (`mysql2`), JWT, bcrypt, dotenv, cors
- Frontend: HTML/CSS/JS (vanilla, Fetch API)
- DB: MySQL (tables created at startup)

## Project Structure
```
smarturl/
├── backend/ (Express API + static frontend)
│   ├── server.js
│   ├── .env
│   ├── routes/ (auth, url, admin)
│   ├── controllers/
│   ├── middleware/
│   └── models/ (db, users, urls)
└── frontend/ (static pages)
    ├── index.html, login.html, register.html
    ├── dashboard.html, admin-dashboard.html
    ├── css/style.css, js/*
```

## Setup
1. Prereqs: Node.js ≥ 18, MySQL running locally or remotely.
2. Create database (match `DB_NAME`):
   ```sql
   CREATE DATABASE smarturl CHARACTER SET utf8mb4;
   ```
3. Configure `backend/.env`:
   ```
   PORT=5052
   JWT_SECRET=replace_me
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=smarturl
   ```
4. Install and run (in `smarturl/backend`):
   ```bash
   npm install
   npm run dev   # or: npm start
   ```
5. Open `http://localhost:5052/`.

On startup, tables are ensured and the `urls.is_favorite` column is added if missing.

## Frontend Pages
- `index.html` – Shortener form + auth links
- `login.html`, `register.html` – Authentication
- `dashboard.html` – User URLs with delete and favorites (star toggle + filter)
- `admin-dashboard.html` – Admin panel with users, URLs, and stats

## Accessing Admin
- New users default to role `user`. Promote to `admin` in MySQL:
  ```sql
  UPDATE users SET role='admin' WHERE email='you@example.com';
  ```
- Log out and log back in (token must include the updated role).
- Visit `http://localhost:5052/admin-dashboard.html` or click the Admin link when visible.

## API Reference
- Auth
  - `POST /api/auth/register` { username, email, password }
  - `POST /api/auth/login` { email, password } → `{ token, user }`
- URL
  - `POST /api/shorten` { originalUrl, customCode? } → `{ shortUrl, shortCode, id }`
  - `GET /api/:shortId` → 302 redirect to original
  - `GET /api/urls` (JWT) → user’s URLs
  - `DELETE /api/url/:id` (JWT)
  - `PUT /api/url/:id/favorite` (JWT) { favorite: true|false }
  - `GET /api/favorites` (JWT) → only favorites
- Admin (JWT + admin role)
  - `GET /api/admin/users` | `DELETE /api/admin/user/:id`
  - `GET /api/admin/urls`  | `DELETE /api/admin/url/:id`
  - `GET /api/admin/stats` → `{ totalUsers, totalUrls, totalClicks }`

## Notes
- JWT is stored in `localStorage`; send `Authorization: Bearer <token>` for protected routes.
- `short_url` aliases are unique; the server validates duplicates and reserved names.
- Redirects increment `click_count`; URLs without protocol are normalized.