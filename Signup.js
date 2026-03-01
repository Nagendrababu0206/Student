const registerForm = document.getElementById("registerForm");
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

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!name || !phone || !email || !password) {
            alert("Please fill all fields.");
            return;
        }

        if (phone.length !== 10) {
            alert("Phone number must be 10 digits.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        try {
            const apiBase = await getApiBase();
            const registerApi = `${apiBase}/api/register`;
            const response = await fetch(registerApi, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, email, password })
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                alert(payload.message || "Registration failed.");
                return;
            }

            alert(payload.message || "Registration successful.");
            window.location.href = "Frontend.html";
        } 
        catch {
            alert("Backend not reachable. If deployed, verify Vercel BACKEND_URL and Render backend health.");
        }
    });
}

