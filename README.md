# Skill Matcher

A job-matching platform that connects students with companies based on actual skills — not just keyword searches. Students build out their profiles, browse jobs, and see how well they match. Companies post roles and instantly see which candidates are the best fit.

---

## What it does

**For students** — you fill out your profile once (education, skills, languages, work experience, projects, certifications), and the platform handles the matching. You can browse all open jobs, see your match percentage for each one, apply directly, and track where your applications stand.

**For companies** — post a job, define the skills you need, and the system surfaces the students who actually meet your criteria. You can view ranked applicants, update their status, and dig into individual profiles when someone looks promising.

**The matching engine** compares required job skills against student skill sets and returns a percentage match, along with which skills matched and which are missing — for both sides.

---

## Tech stack

**Backend** — Node.js + Express (CommonJS), PostgreSQL, JWT auth, bcrypt, nodemailer for OTP emails.

**Frontend** — React with React Router and Context API for auth state. Calls the backend over plain fetch.

---

## Project structure

```
backend/
  controllers/
  middleware/
  routes/
  db.js
  index.js
  skillMatcher.sql

frontend/
  src/
    components/
    context/
    pages/
    App.jsx
    main.jsx
```

---

## Getting started

### 1. Set up the database

Create a PostgreSQL database, then run the schema:

```bash
psql -U postgres -d skillmatcher -f backend/skillMatcher.sql
```

> The SQL file includes both table definitions and some utility queries — review it before running in production.

### 2. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=your_jwt_secret

DB_USER=postgres
DB_HOST=localhost
DB_NAME=skillmatcher
DB_PASSWORD=your_password
DB_PORT=5432

EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

### 3. Start the backend

```bash
cd backend
npm install
node index.js
```

The server runs at `http://localhost:5000`. For auto-reload during development:

```bash
npx nodemon index.js
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173` by default.

---

## How auth works

Both students and companies go through the same flow:

1. Sign up with email + password
2. Log in → an OTP gets sent to your email
3. Verify the OTP
4. Receive a JWT token
5. Pass the token in every protected request:

```http
Authorization: Bearer <your_token>
```

---

## API overview

Base URL: `http://localhost:5000`

### Student auth — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Create account |
| POST | `/login` | Login + trigger OTP |
| POST | `/verify-otp` | Verify OTP, receive JWT |

### Student profile — `/api/profile` *(protected)*
| Method | Route |
|--------|-------|
| GET | `/` |
| POST | `/` |

### Student sections — all protected, all follow the same pattern
Each of these supports `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`:

- `/api/education`
- `/api/skills`
- `/api/languages`
- `/api/experience`
- `/api/projects`
- `/api/certifications`

### Company auth — `/api/company/auth`
Same as student auth: `/signup`, `/login`, `/verify-otp`

### Company profile — `/api/company/profile` *(protected)*
`GET /` and `POST /`

### Jobs — `/api/jobs`
| Method | Route | Auth |
|--------|-------|------|
| GET | `/` | Public |
| GET | `/:id` | Public |
| GET | `/company/my-jobs` | Protected |
| POST | `/` | Protected |
| PUT | `/:id` | Protected |
| DELETE | `/:id` | Protected |

### Applications — `/api/applications` *(protected)*
| Method | Route |
|--------|-------|
| POST | `/apply` |
| GET | `/my-applications` |
| GET | `/job/:job_id` |
| PUT | `/:id/status` |

### Matching — `/api/matching` *(protected)*
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/jobs` | Matched jobs for logged-in student |
| GET | `/students/:job_id` | Matched students for a job |

### Company viewing student profiles — `/api/student` *(protected)*
`GET /profile/:student_id`, `/education/:student_id`, `/skills/:student_id`, `/languages/:student_id`, `/experience/:student_id`, `/projects/:student_id`, `/certifications/:student_id`

### Other
- `GET /api/company/all-applicants` — all applicants across company jobs
- `POST /api/form/google-submit` — Google Form integration

---

## Frontend routes

### Student
`/` · `/login` · `/otp` · `/dashboard` · `/profile` · `/education` · `/skills` · `/languages` · `/experience` · `/projects` · `/certifications` · `/jobs` · `/job/:id` · `/my-applications` · `/analytics` · `/generate-resume`

### Company
`/company/signup` · `/company/login` · `/company/otp` · `/company/dashboard` · `/company/profile` · `/company/post-job` · `/company/my-jobs` · `/company/job-applicants/:job_id` · `/company/matched-students/:job_id` · `/company/student-profile/:student_id` · `/company/applicants`

---

## Things to fix before going to production

- Move the hardcoded `http://localhost:5000` API base URL to an environment variable on the frontend.
- Don't return the OTP in the API response — email only.
- Companies currently reuse the student OTP table. They should have their own.
- Add rate limiting, input validation, and proper security headers.
- Lock down CORS to specific origins instead of wildcard.

---

## Common issues

**DB connection failed** — double-check the `DB_*` values in `.env` and make sure PostgreSQL is actually running.

**401 Unauthorized** — make sure you're sending `Authorization: Bearer <token>` with every protected request.

**OTP not working** — OTPs expire after 5 minutes. Request a new one if it's been a while.

**Frontend can't reach the API** — the backend needs to be running on port 5000 before you start the frontend.

---

## License

ISC
