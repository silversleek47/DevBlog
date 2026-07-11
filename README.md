# MERN Blog

Full-stack blog app: MongoDB + Mongoose, Express, React (Vite) + Redux Toolkit,
JWT auth in HTTP-only cookies, and an on-demand AI summary feature per post.

## Project structure

```
backend/
  models/          Post.js, User.js (Mongoose schemas)
  controllers/      authController.js, postController.js
  middleware/       requireAuth.js (JWT cookie verification)
  server.js         Express app + route wiring + Mongo connection
frontend/
  src/
    api/axios.js           Shared axios instance (withCredentials: true)
    store/                 Redux Toolkit store + authSlice
    components/            Navbar, PostCard
    pages/                 Login (login+signup), Home (list+create), PostDetail (read+delete+AI summary)
    App.jsx, main.jsx
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then edit .env — see below
npm run dev                # nodemon-free watch mode (Node 18+ --watch), or: npm start
```

`.env` values you must set:
- `MONGO_URI` — your MongoDB connection string (local or Atlas)
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `CLIENT_URL` — where the frontend runs (default `http://localhost:5173`)

The server refuses to boot if `MONGO_URI` or `JWT_SECRET` is missing, rather
than silently running in a broken state.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL defaults to http://localhost:5000/api
npm run dev
```

Open `http://localhost:5173`.

## 3. How auth works

- Signup/login hit `/api/auth/signup` and `/api/auth/login`. On success the
  server sets an **httpOnly** cookie named `token` containing a signed JWT —
  it is never exposed to JS, so it can't be read or exfiltrated by client-side code.
- Every frontend request goes through the shared `api` axios instance
  (`src/api/axios.js`), which sets `withCredentials: true` so the cookie is
  sent automatically. No token handling exists anywhere in the React code.
- On app boot, `App.jsx` dispatches `fetchCurrentUser()`, which calls
  `GET /api/auth/me` (protected by `requireAuth`) to silently restore the
  session after a page refresh.
- `requireAuth` middleware verifies the JWT and attaches the user to
  `req.user` for any protected route (`createPost`, `deletePost`, `generateSummary`, `getMe`).

## 4. AI summary flow

1. User clicks "✨ Generate AI Summary" on `PostDetail`.
2. Frontend calls `POST /api/posts/:id/summary` and shows a loading spinner.
3. Backend (`generateSummary` in `postController.js`) checks `post.summary`:
   - If already set, it's returned immediately (`cached: true`) — no repeated AI calls.
   - If not, it calls `generateMockSummary()` (a stand-in async call with a
     simulated delay), saves the result to the post document, and returns it.
4. To wire up a real AI provider, replace the body of `generateMockSummary`
   with an actual API call — the caching/persistence logic around it doesn't change.

## 5. Notes on design choices

- Signup and login are combined into one `Login.jsx` page (toggle between
  modes) to match the exact page list requested, rather than adding an
  extra `Signup` page.
- Post creation lives in a form at the top of `Home.jsx` (visible only when
  logged in) rather than a separate route, again to keep to the requested
  page structure while still supporting full CRUD.
- Routes are registered directly in `server.js` rather than a separate
  `routes/` folder, matching the file list you specified.
