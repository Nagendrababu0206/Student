const loginForm = document.getElementById("loginForm");
const API_BASE =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:3001"
        : "https://YOUR-BACKEND-SERVICE.onrender.com";
const LOGIN_API = `${API_BASE}/api/login`;

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
            const response = await fetch(LOGIN_API, {
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
            alert("Backend not reachable. Start Java backend on port 3001.");
        }
    });
}

