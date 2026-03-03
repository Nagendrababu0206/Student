const loginForm = document.getElementById("loginForm");
const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const LOCAL_API_BASE = "http://localhost:3001";
let remoteApiBase = "";
const API_BASE_STORAGE_KEY = "eduaiApiBase";

function normalizeBackendUrl(value) {
    return String(value || "")
        .trim()
        .replace(/\/+$/, "")
        .replace(/\/api\/health$/i, "")
        .replace(/\/api$/i, "");
}

async function getApiBase() {
    if (IS_LOCAL) {
        return LOCAL_API_BASE;
    }
    if (remoteApiBase) {
        return remoteApiBase;
    }

    const cached = normalizeBackendUrl(localStorage.getItem(API_BASE_STORAGE_KEY));
    if (cached) {
        remoteApiBase = cached;
        return remoteApiBase;
    }

    try {
        const response = await fetch("/api/config");
        if (response.ok) {
            const payload = await response.json();
            if (payload?.backendUrl) {
                remoteApiBase = normalizeBackendUrl(payload.backendUrl);
                localStorage.setItem(API_BASE_STORAGE_KEY, remoteApiBase);
            }
        }
    } catch {
        // Keep proxy fallback below.
    }
    return remoteApiBase;
}

async function postLogin(payload) {
    // Fast path: same-origin proxy avoids one extra config request on each login.
    const proxyResponse = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    // If proxy works (typical deployed flow), use it directly.
    if (proxyResponse.status !== 404 && proxyResponse.status !== 405) {
        return proxyResponse;
    }

    // Fallback to explicit backend URL resolution for local/non-proxy flows.
    const apiBase = await getApiBase();
    const directLoginApi = `${apiBase}/api/login`;
    return fetch(directLoginApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            alert("Please fill in email and password.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        try {
            const response = await postLogin({ username, password });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                alert(payload.message || "Login failed.");
                return;
            }

            const payload = await response.json();
            localStorage.setItem("eduaiCurrentUser", payload.user || username);
            window.location.replace("HomePage.html");
        } catch {
            alert("Backend not reachable. If deployed, verify Vercel BACKEND_URL and Render backend health.");
        }
    });
}

