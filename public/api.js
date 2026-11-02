// LMS API helper - copy this file next to your HTML pages and load it with:
//     <script src="api.js"></script>
//
// 1) Same origin (recommended): put your frontend files in this /public folder and open
//        http://localhost:3000/yourpage.html          -> API_BASE can stay ''
// 2) Different origin (Live Server, Vite, ...): set the API address once, BEFORE you use the helper:
//        window.LMS_API_BASE = 'http://localhost:3000';   // and add your page's origin to CORS_ORIGIN in .env
//
// Every call returns the "data" part of { success, message, data }, or THROWS an Error with the
// server's message (error.status = HTTP status, error.errors = field details when present).
(function () {
  const TOKEN_KEY = 'lms_token';
  const USER_KEY = 'lms_user';
  const base = () => (window.LMS_API_BASE || '').replace(/\/$/, '');

  const store = {
    get token() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } },
    get user() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; } },
    save(token, user) { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); },
    clear() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
  };

  async function request(method, path, body) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (store.token) headers.Authorization = 'Bearer ' + store.token;

    let res;
    try {
      res = await fetch(base() + '/api' + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (networkError) {
      const err = new Error('Cannot reach the server. Is it running, and is the API address correct?');
      err.status = 0;
      throw err;
    }

    let json = null;
    try { json = await res.json(); } catch (e) { /* empty body */ }

    if (res.status === 401 && store.token && path !== '/auth/login') {
      store.clear();                               // token expired or invalid -> back to the login page
      if (window.LMS_LOGIN_PAGE) window.location.href = window.LMS_LOGIN_PAGE;
    }
    if (!res.ok || (json && json.success === false)) {
      const err = new Error((json && json.message) || 'Request failed (' + res.status + ')');
      err.status = res.status;
      err.errors = json && json.errors;
      throw err;
    }
    return json ? json.data : null;
  }

  const api = {
    get: (p) => request('GET', p),
    post: (p, b) => request('POST', p, b === undefined ? {} : b),
    put: (p, b) => request('PUT', p, b),
    del: (p) => request('DELETE', p),

    // ---- session ----
    async login(email, password) {
      const data = await request('POST', '/auth/login', { email, password });
      store.save(data.token, data.user);
      return data.user;                            // { user_id, role: 'admin'|'instructor'|'student', ... }
    },
    async register(first_name, last_name, email, password) {
      const data = await request('POST', '/auth/register', { first_name, last_name, email, password });
      store.save(data.token, data.user);
      return data.user;
    },
    logout() { store.clear(); },
    currentUser: () => store.user,
    isLoggedIn: () => !!store.token,

    // Send each role to its own screen:  api.goToDashboard({ admin:'admin.html', instructor:'teacher.html', student:'student.html' })
    goToDashboard(pages) {
      const u = store.user;
      if (!u || !pages[u.role]) return false;
      window.location.href = pages[u.role];
      return true;
    },
    // Call at the top of a protected page:  api.requireRole('student', 'login.html')
    requireRole(role, loginPage) {
      const u = store.user;
      if (!store.token || !u || (role && ![].concat(role).includes(u.role))) { window.location.href = loginPage || '/'; return false; }
      return true;
    },
  };

  window.LMS = api;
})();
