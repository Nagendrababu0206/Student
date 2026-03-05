const welcomeTeacher = document.getElementById("welcomeTeacher");
const logoutBtn = document.getElementById("logoutBtn");

const currentUser = localStorage.getItem("eduaiCurrentUser") || "teacher@eduai.com";
if (welcomeTeacher) {
    welcomeTeacher.textContent = `Teacher: ${currentUser.split("@")[0]}`;
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("eduaiCurrentUser");
        localStorage.removeItem("eduaiUserRole");
        window.location.href = "Frontend.html";
    });
}
