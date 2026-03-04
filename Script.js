const loginForm = document.getElementById("loginForm");
const IS_LOCAL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:" ||
    window.location.hostname === "";
const LOCAL_API_BASE = "http://localhost:3001";
let remoteApiBase = "";
const API_BASE_STORAGE_KEY = "eduaiApiBase";
const PROXY_LOGIN_TIMEOUT_MS = 1800;
const DIRECT_LOGIN_TIMEOUT_MS = PROXY_LOGIN_TIMEOUT_MS + 1200;

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

const resolvedApiBasePromise = IS_LOCAL ? Promise.resolve(LOCAL_API_BASE) : getApiBase();

function warmupHomePageAssets() {
    const assets = ["HomePage.html", "homeStyle.css", "homePage_resources.js"];
    const head = document.head;
    if (!head) {
        return;
    }
    assets.forEach((href) => {
        if (head.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
            return;
        }
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = href;
        head.appendChild(link);
    });
}

function postJson(url, payload, timeoutMs = 0) {
    const controller = timeoutMs > 0 ? new AbortController() : null;
    const timeoutId =
        controller && timeoutMs > 0
            ? setTimeout(() => controller.abort(), timeoutMs)
            : null;

    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
    }).finally(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    });
}

function isHandledLoginStatus(status) {
    return status === 200 || status === 400 || status === 401 || status === 403;
}

function resolveFirstUsableResponse(requests) {
    return new Promise((resolve, reject) => {
        let completed = 0;
        let lastResponse = null;
        let lastError = null;
        let settled = false;

        requests.forEach((requestPromise) => {
            requestPromise
                .then((response) => {
                    if (settled) {
                        return;
                    }
                    completed += 1;
                    lastResponse = response;
                    if (isHandledLoginStatus(response.status)) {
                        settled = true;
                        resolve(response);
                        return;
                    }
                    if (completed === requests.length) {
                        settled = true;
                        if (lastResponse) {
                            resolve(lastResponse);
                        } else {
                            reject(lastError || new Error("Login request failed."));
                        }
                    }
                })
                .catch((error) => {
                    if (settled) {
                        return;
                    }
                    completed += 1;
                    lastError = error;
                    if (completed === requests.length) {
                        settled = true;
                        if (lastResponse) {
                            resolve(lastResponse);
                        } else {
                            reject(lastError || new Error("Login request failed."));
                        }
                    }
                });
        });
    });
}

async function postLogin(payload) {
    // Local/file mode: call backend directly to avoid missing /api proxy routes.
    if (IS_LOCAL) {
        const directLoginApi = `${LOCAL_API_BASE}/api/login`;
        return postJson(directLoginApi, payload);
    }

    const requests = [postJson("/api/login", payload, PROXY_LOGIN_TIMEOUT_MS)];
    const apiBasePromise = resolvedApiBasePromise
        .then((value) => value || getApiBase())
        .catch(() => "");

    // Start direct call as soon as backend URL is available; race it with proxy.
    requests.push(
        apiBasePromise.then((apiBase) => {
            if (!apiBase) {
                throw new Error("Direct API base unavailable");
            }
            const directLoginApi = `${apiBase}/api/login`;
            return postJson(directLoginApi, payload, DIRECT_LOGIN_TIMEOUT_MS);
        })
    );

    return resolveFirstUsableResponse(requests);
}

if (loginForm) {
    if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => warmupHomePageAssets());
    } else {
        setTimeout(() => warmupHomePageAssets(), 0);
    }

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

            localStorage.setItem("eduaiCurrentUser", username);
            window.location.replace("HomePage.html");
        } catch {
            alert("Backend not reachable. If deployed, verify Vercel BACKEND_URL and Render backend health.");
        }
    });
}

