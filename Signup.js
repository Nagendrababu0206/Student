const registerForm = document.getElementById("registerForm");
const API_BASE =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:3001"
        : "";
const REGISTER_API = `${API_BASE}/api/register`;

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
            const response = await fetch(REGISTER_API, {
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
            alert("Backend not reachable. Start Java backend on port 3001.");
        }
    });
}

