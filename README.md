# Learning Module Management System (lms_final_database)

Node.js + Express + MySQL REST API with Adaptive Learning Progression. Your HTML/CSS/JS goes in `public/`.

Request flow: **Frontend -> route -> auth/role middleware -> controller -> service -> model -> MySQL -> JSON**

## Setup

```bash
npm install
cp .env.example .env                                  # then set DB_PASSWORD and JWT_SECRET (and DB_PORT if not 3306)
mysql -u root -p < database/schema.sql                # creates lms_final_database + 20 tables
mysql -u root -p lms_final_database < database/seed.sql   # roles
npm run seed                                          # sample data for every feature
npm run dev                                           # http://localhost:3000
```

Start over with fresh sample data: `npm run seed:reset`.

| Command | What it does |
|---|---|
| `npm run dev` | Start the server with auto-restart (nodemon) |
| `npm start` | Start the server |
| `npm run seed` | Insert sample data (only when no users exist) |
| `npm run seed:reset` | Wipe all tables, insert sample data again |
| `npm run routes` | List every API route (no database needed) |
| `npm run check:api` | Call the running API and print PASS / FAIL per route |
| `npm test` | Unit tests for grading, the 74% / 75% rule and date handling (no database needed) |

**Connecting your frontend, HTTPS, Postman and testing: see [docs/CONNECT_AND_TEST.md](docs/CONNECT_AND_TEST.md).** Import `postman/LMS.postman_collection.json` into Postman.

## Sample accounts (password for all: `Password123!`)

| Email | Role | What it shows |
|---|---|---|
| admin@lms.test | admin | Everything, all reports |
| instructor@lms.test | instructor (DBMS101) | Manage courses, unlock students |
| instructor2@lms.test | instructor (SIA201) | A second instructor |
| student@lms.test | student | Fresh account, no progress: use it for the live demo |
| mia@lms.test | student | Passed every quiz, all modules unlocked |
| noah@lms.test | student | Scored 74%: Module 2 LOCKED |
| liam@lms.test | student | Scored 75%: Module 2 UNLOCKED |
| ella@lms.test | student | Used all attempts, instructor override granted |
| jack@lms.test | student | Used all attempts, waiting for an override |
| zed@lms.test | student | Quiz attempts but no enrollment (Report 6 "activity only") |
| ruth@lms.test | student | Enrolled but no activity (Report 6 "enrollment only") |

## Folder structure and naming

```
database/   schema.sql  seed.sql  sampleData.js  migrations/
src/
  server.js  db.js
  routes/       user.js            -> one file per feature (index.js mounts them all)
  controllers/  user.controller.js -> req/res only
  services/     user.service.js    -> business rules, throws AppError
  models/       user.models.js     -> SQL only
  middleware/   auth.js  role.js  errorHandler.js  notFound.js
  lib/          config.js  roles.js  password.js  token.js  validate.js  grading.js  mastery.js  logic.test.js
  utils/        AppError.js  asyncHandler.js  response.js  sql.js  listRoutes.js  checkApi.js
public/     your HTML, CSS, JavaScript  (api.js = fetch helper for the frontend)
postman/    Postman collection + environment
docs/       CONNECT_AND_TEST.md
```

## Adaptive Learning (the major feature)

```
module mastered = every published lesson completed
                  AND latest graded score of every published quiz >= minimum_score (75)
module unlocked = student enrolled AND every prerequisite module mastered (or instructor override)
```

Demo: log in as `noah@lms.test` (74%, locked) and `liam@lms.test` (75%, unlocked), open DBMS101, Module 2.
Or log in as `student@lms.test`, finish the two Module 1 lessons, answer quiz questions 1 and 2 only (74%), then retake and also answer question 4 (75%).
Rule code: `src/lib/mastery.js`, queries in `src/models/adaptive.models.js`, orchestration in `src/services/adaptive.service.js`.

## API

Every response: `{ "success": true, "message": "...", "data": ... }` or `{ "success": false, "message": "..." }`.
Every route except register, login and health needs `Authorization: Bearer <token>`.
Run `npm run routes` for the full, always-current list with who may call each route.

## Rules for adding code

1. Use the shared pool (`require('../db')`) and `?` placeholders only.
2. Layers: model (SQL) -> service (rules, throws `AppError`) -> controller (req/res) -> route.
3. Name files `<feature>.js`, `<feature>.controller.js`, `<feature>.service.js`, `<feature>.models.js`.
4. Use `asyncHandler`, `success()` / `created()`, and the `auth` and `role()` middleware.
5. Work on your feature branch, open a pull request into `develop`, merge with a merge commit (no squash). Commit like `feat: add module CRUD endpoints`.
