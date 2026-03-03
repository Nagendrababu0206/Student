const loginForm = document.getElementById("loginForm");
const IS_LOCAL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:" ||
    window.location.hostname === "";
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
    // Local/file mode: call backend directly to avoid missing /api proxy routes.
    if (IS_LOCAL) {
        const directLoginApi = `${LOCAL_API_BASE}/api/login`;
        return fetch(directLoginApi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    }

    let proxyResponse = null;
    try {
        // Fast path: same-origin proxy avoids one extra config request on each login.
        proxyResponse = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (proxyResponse.ok) {
            return proxyResponse;
        }
    } catch {
        // Fallback to direct backend URL below.
    }

    const shouldFallback =
        !proxyResponse ||
        proxyResponse.status === 404 ||
        proxyResponse.status === 405 ||
        proxyResponse.status >= 500;

    if (shouldFallback) {
        const apiBase = await getApiBase();
        if (apiBase) {
            const directLoginApi = `${apiBase}/api/login`;
            return fetch(directLoginApi, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }
    }

    return proxyResponse;
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
                alert(payload.message || payload.error || "Login failed.");
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

