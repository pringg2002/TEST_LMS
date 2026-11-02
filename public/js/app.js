const TOKEN_KEY = 'lms_token';
const USER_KEY = 'lms_user';


function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}


function getUser() {

    try {

        return JSON.parse(
            localStorage.getItem(USER_KEY)
        );

    } catch (error) {

        return null;

    }

}


function saveSession(token, user) {

    localStorage.setItem(
        TOKEN_KEY,
        token
    );

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
    );

}


function clearSession() {

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

}


async function api(
    path,
    {
        method = 'GET',
        body = undefined
    } = {}
) {

    const headers = {
        'Content-Type': 'application/json'
    };


    const token = getToken();


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response = await fetch(path, {

        method,

        headers,

        body:
            body !== undefined
                ? JSON.stringify(body)
                : undefined

    });


    let result = null;


    try {

        result = await response.json();

    } catch (error) {

        result = null;

    }


    if (
        response.status === 401 &&
        !path.startsWith('/api/auth/login')
    ) {

        clearSession();

        window.location.href =
            '/login.html';

        throw new Error(
            'Session expired. Please log in again.'
        );

    }


    if (!response.ok) {

        throw new Error(
            result?.message ||
            `Request failed (${response.status})`
        );

    }


    if (
        !result ||
        result.success === false
    ) {

        throw new Error(
            result?.message ||
            'Request failed.'
        );

    }


    return result.data;

}


function requireLogin() {

    const token = getToken();


    if (!token) {

        window.location.href =
            '/login.html';

        return false;

    }


    return true;

}


function showMessage(
    element,
    text,
    type = 'error'
) {

    if (!element) {
        return;
    }


    element.textContent = text;

    element.className =
        `msg ${type}`;

}


function esc(value) {

    return String(value ?? '')
        .replace(
            /[&<>"']/g,
            (character) => ({

                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'

            }[character])
        );

}


function isStaffUser() {

    const user = getUser() || {};

    return [
        'admin',
        'instructor'
    ].includes(user.role);

}


function qs(name) {

    return new URLSearchParams(
        window.location.search
    ).get(name);

}


function renderTopbar() {

    const element =
        document.getElementById('topbar');


    if (!element) {
        return;
    }


    const user =
        getUser() || {};


    element.className =
        'topbar';


    element.innerHTML = `

        <a
            class="brand"
            href="/dashboard.html"
        >
            Learning Module System
        </a>

        <nav>

            <a href="/dashboard.html">
                Dashboard
            </a>

            <a href="/courses.html">
                Courses
            </a>

            <a href="/assignments.html">
                Assignments
            </a>

            <a href="/discussions.html">
                Discussions
            </a>

            <span class="badge">
                ${esc(user.role || 'guest')}
            </span>

            <button
                class="secondary"
                id="logout-btn"
                type="button"
            >
                Log out
            </button>

        </nav>
    `;


    const logoutButton =
        document.getElementById('logout-btn');


    if (logoutButton) {

        logoutButton.addEventListener(
            'click',
            () => {

                clearSession();

                window.location.href =
                    '/login.html';

            }
        );

    }

}

function statusBadge(status) {

    return `
        <span class="badge">
            ${esc(status)}
        </span>
    `;

}

const moduleRenderHooks = [];

if (
    document.readyState === 'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        renderTopbar
    );

} else {

    renderTopbar();

}