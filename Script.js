const loginForm = document.getElementById("loginForm");
const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const LOCAL_API_BASE = "http://localhost:3001";
let remoteApiBase = "";

async function getApiBase() {
    if (IS_LOCAL) {
        return LOCAL_API_BASE;
    }
    if (remoteApiBase) {
        return remoteApiBase;
    }
    try {
        const response = await fetch("/api/config");
        if (response.ok) {
            const payload = await response.json();
            if (payload?.backendUrl) {
                remoteApiBase = String(payload.backendUrl).replace(/\/+$/, "");
            }
        }
    } catch {
        // Keep proxy fallback below.
    }
    return remoteApiBase;
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
            const apiBase = await getApiBase();
            const loginApi = `${apiBase}/api/login`;
            const response = await fetch(loginApi, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                alert(payload.message || "Login failed.");
                return;
            }

            const payload = await response.json();
            localStorage.setItem("eduaiCurrentUser", payload.user || username);
            window.location.href = "HomePage.html";
        } catch {
            alert("Backend not reachable. If deployed, verify Vercel BACKEND_URL and Render backend health.");
        }
    });
}

