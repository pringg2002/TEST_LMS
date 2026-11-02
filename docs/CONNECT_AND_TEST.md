# Connect the frontend to the API and the database, then test it

Request flow: **Frontend (fetch) → Express route → auth/role middleware → controller → service → model → MySQL → JSON back**

You need: Node.js 18+, MySQL 8 (or MariaDB 10.4+ from XAMPP), Postman.

---

## Part 1 – Start the backend and connect it to MySQL

1. **Install packages** (project root, the folder with `package.json`):
   ```bash
   npm install
   ```
2. **Create the database tables** (creates `lms_final_database` and 20 tables; safe to run again):
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p lms_final_database < database/seed.sql     # the 3 roles
   ```
   *XAMPP/phpMyAdmin instead of the command line:* open phpMyAdmin → **Import** → choose `schema.sql`, then `seed.sql`.
3. **Create your `.env`** – copy `.env.example` to `.env` and fill it in:
   ```
   DB_HOST=localhost
   DB_PORT=3306            # MAMP users: 8889
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=lms_final_database
   JWT_SECRET=<long random text>
   ```
4. **Load sample data** (users for all three roles + courses, quizzes, …):
   ```bash
   npm run seed
   ```
5. **Run the server**:
   ```bash
   npm run dev
   ```
   You must see **both** lines – the first one proves the database connection:
   ```
   [db] Connected to lms_final_database on localhost:3306
   Server running at http://localhost:3000
   ```
6. Open `http://localhost:3000/api/health` → `{"success":true,"message":"Learning Module API is running",...}`

Sample logins (password for all: `Password123!`): `admin@lms.test`, `instructor@lms.test`, `student@lms.test` (plus mia/noah/liam/ella/jack, see README).

---

## Part 2 – Connect your existing frontend

### Option A (simplest, no CORS): serve the frontend from this server
Copy your HTML/CSS/JS into the `public/` folder and open `http://localhost:3000/yourpage.html`.
Because page and API share one address, you can call `fetch('/api/...')` with a relative URL.

### Option B: frontend stays where it is (Live Server, Vite, another folder…)
1. Use the **full API address** in your fetch calls (`http://localhost:3000/api/...`).
2. Tell the API to accept your page's origin – in `.env`:
   ```
   CORS_ORIGIN=http://127.0.0.1:5500,http://localhost:5173
   ```
   (the exact address shown in the browser bar, without a path). Restart the server.
   If you see *"blocked by CORS policy"* in the browser console, this is the fix. `localhost` and `127.0.0.1` count as different origins.

### The easy way: `public/api.js`
Copy `public/api.js` next to your pages and add `<script src="api.js"></script>`. It handles the base URL, the token and error messages:

```html
<script>window.LMS_API_BASE = 'http://localhost:3000';</script>   <!-- only for Option B -->
<script src="api.js"></script>
<script>
  // LOGIN PAGE
  const user = await LMS.login(email, password);            // saves token + user in localStorage
  LMS.goToDashboard({ admin: 'admin.html', instructor: 'teacher.html', student: 'student.html' });

  // ANY PROTECTED PAGE – put at the top
  if (!LMS.requireRole('student', 'login.html')) throw new Error('not allowed');

  // CALLS (each returns the "data" part, or throws Error(message))
  const courses  = await LMS.get('/courses');
  const modules  = await LMS.get(`/courses/${id}/modules`);
  await LMS.post('/enrollments', { course_id: id });
  await LMS.put(`/progress/${progressId}`, { status: 'completed' });
  await LMS.del(`/announcements/${id}`);
</script>
```

### Without the helper (plain fetch)
```js
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const json = await res.json();                 // { success, message, data }
if (!json.success) throw new Error(json.message);
localStorage.setItem('token', json.data.token);

// every other request:
fetch('http://localhost:3000/api/courses', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
```

### What each screen calls

| Screen | Role | Main endpoints |
|---|---|---|
| Login / register | all | `POST /auth/login`, `POST /auth/register` (always creates a student), `GET /auth/me` |
| Course list | student | `GET /courses` (published only), `POST /enrollments {course_id}` |
| Course page | student | `GET /courses/:id/progress` (every module + locked/unlocked + reason) |
| Lesson | student | `GET /modules/:id/lessons`, `GET /lessons/:id`, `POST /progress {lesson_id, status:"completed"}` |
| Quiz | student | `GET /quizzes/:id/questions` → `POST /quizzes/:id/attempts` → `POST /attempts/:id/answers` → `POST /attempts/:id/submit` |
| Assignment | student | `GET /modules/:id/assignments`, `POST /assignments/:id/submissions` |
| Discussion | all | `GET/POST /modules/:id/discussions`, `POST /discussions/:id/replies` |
| Notifications | all | `GET /notifications`, `PUT /notifications/:id/read` |
| Manage courses/modules/lessons/quizzes | instructor, admin | `POST/PUT/DELETE` on `/courses`, `/modules`, `/lessons`, `/quizzes`, `/questions` |
| Grade work | instructor, admin | `GET /assignments/:id/submissions`, `PUT /submissions/:id {score, feedback}` |
| Enroll / unlock students | instructor | `GET /users/students`, `POST /enrollments {course_id, student_id}`, `GET /modules/:id/unlock-candidates`, `POST /modules/:id/unlocks` |
| User management, reports | admin | `GET/POST/PUT/DELETE /users`, `GET /reports/*` |

Run `npm run routes` for the complete, always-current list.

### Things your frontend must know
* **Response shape** is always `{ success, message, data }`; failures are `{ success:false, message }` with HTTP 400/401/403/404/409.
* **Send the token** on every call except register/login: `Authorization: Bearer <token>`. A `401` means missing/expired token → send the user to the login page.
* **Roles** come back as `user.role` = `"admin" | "instructor" | "student"`. Hiding a button is cosmetic; the API enforces the real permissions (403).
* **New courses/modules/lessons/quizzes start as `draft`** and students cannot see drafts. Send `"status": "published"` (or edit it later) for students to see them.
* **DECIMAL columns arrive as strings** (`"75.00"`, scores, points). Use `Number(x)` before comparing or calculating.
* **Dates** arrive as ISO strings (`2026-11-05T02:00:00.000Z`) – use `new Date(value)` and format for display. Send dates as `2026-11-05T10:00:00` (local time) or a full ISO string.
* **Quiz answers**: multiple choice → send the option text; true/false → `"True"`/`"False"`; short answer → typed text (case-insensitive).
* **Students never receive `correct_answer`.** Marking is done by the server.

---

## Part 3 – Run over HTTPS (optional)

Browsers only require HTTPS for a deployed site; for school/local work http is fine. To enable it:

```bash
mkdir certs
openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/key.pem -out certs/cert.pem -days 365 \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```
Add to `.env`:
```
SSL_KEY_PATH=certs/key.pem
SSL_CERT_PATH=certs/cert.pem
```
Restart → `Server running at https://localhost:3000`. The browser warns about the self-signed certificate (click *Advanced → Continue*).
**Postman:** Settings → General → turn **SSL certificate verification** off, and set the `baseUrl` variable to `https://localhost:3000`.
If your frontend uses https, the API must too (browsers block https pages calling http APIs) – and update `CORS_ORIGIN`.
For a real deployment use a real certificate (Let's Encrypt) or put the app behind a host/proxy that provides HTTPS, set `NODE_ENV=production`, and use a strong `JWT_SECRET`.

---

## Part 4 – How to test

### 1. Unit tests (no database)
```bash
npm test          # grading, the 74% / 75% rule, attempt limits, date handling
```

### 2. Automatic API check (database + server must be running, sample data loaded)
```bash
npm run seed:reset      # known data
npm run dev             # terminal 1
npm run check:api       # terminal 2 → PASS/FAIL for every main route, the permission checks and the 74%/75% rule
```

### 3. Postman
1. **Import** `postman/LMS.postman_collection.json` and `postman/LMS.postman_environment.json`; select the *LMS local* environment.
2. Open folder **0. Health & Login** and send **Login as STUDENT**. The test script stores the token – every other request now uses it.
3. Run any request. The *Tests* tab shows green/red checks. To test another role, send a different **Login as …** request first.
4. Run a whole folder with **Run collection** (e.g. section 5 as a student, then section 2 as an instructor).
5. IDs in the collection default to the sample data (`courseId=1`, `moduleId=1`, …); change them under the collection's *Variables* tab.

Suggested test script (each line = one expectation):

| Test | Expect |
|---|---|
| Login with the wrong password | 401 |
| `GET /users` as student | 403 |
| `POST /courses` as student | 403 |
| `POST /courses` twice with the same `course_code` | 201 then 409 |
| `POST /courses` without `course_name` | 400 |
| `GET /courses/999999` | 404 |
| Student: `GET /quizzes/:id/questions` | no `correct_answer` field |
| Noah (74%): `GET /modules/2/access` | `unlocked:false` |
| Liam (75%): `GET /modules/2/access` | `unlocked:true` |
| Noah: `GET /lessons/<lesson of module 2>` or its quiz questions | 403 (locked) |
| Student: start attempt → answer → submit | `score`, `passed` |
| Student tries a 4th attempt on a 3-attempt quiz | 403 |

### 4. Database check
After an API call, look at the table:
```sql
USE lms_final_database;
SELECT user_id, email, role_id FROM users ORDER BY user_id DESC LIMIT 3;   -- after Register
SELECT attempt_id, student_id, score, status FROM attempts ORDER BY attempt_id DESC LIMIT 3;   -- after submit
```

### 5. Browser check
Open `http://localhost:3000/` – `public/index.html` is a small page that checks the server, logs in, and loads courses with a token. If it works, your own frontend can too.
In your own pages, keep the browser **DevTools → Network** tab open: click a request to see its status, the JSON response and the `Authorization` header.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `[db] Connection FAILED: ECONNREFUSED` | MySQL isn't running, or wrong `DB_HOST`/`DB_PORT` (MAMP = 8889). |
| `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER`/`DB_PASSWORD` in `.env`. |
| `ER_BAD_DB_ERROR: Unknown database` | Run `schema.sql` first. |
| Register/login says *Student role is missing* | Run `database/seed.sql`. |
| `Login failed` for sample users | Run `npm run seed:reset`. |
| Browser: *blocked by CORS policy* | Set `CORS_ORIGIN` to the page's exact origin and restart (Part 2, Option B). |
| `401 Authentication required` | Token missing – log in again; check the `Authorization: Bearer …` header. |
| `403` on a lesson/quiz | The module is locked (prerequisite < 75%) or the student isn't enrolled – the message says which. |
| `EADDRINUSE` | Port 3000 is used – change `PORT` in `.env` (and your frontend/Postman address). |
| Changed `.env` but nothing changed | Restart `npm run dev`. |
