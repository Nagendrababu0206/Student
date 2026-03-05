const SUBMISSIONS_STORAGE_KEY = "eduaiAssignmentSubmissions";
const submissionsGrid = document.getElementById("submissionsGrid");
const emptyState = document.getElementById("emptyState");
const logoutBtn = document.getElementById("logoutBtn");

function readSubmissions() {
    try {
        const parsed = JSON.parse(localStorage.getItem(SUBMISSIONS_STORAGE_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function formatDateTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString();
}

function renderSubmissions() {
    const submissions = readSubmissions().slice().reverse();
    submissionsGrid.innerHTML = "";

    if (!submissions.length) {
        emptyState.textContent = "No student submissions yet. Ask students to submit assignments first.";
        return;
    }

    emptyState.textContent = "";

    submissions.forEach((item) => {
        const card = document.createElement("article");
        card.className = "submission-card";

        const heading = document.createElement("h4");
        heading.textContent = `${item.studentName || "Student"} - ${item.subject || "subject"}`;
        card.appendChild(heading);

        const meta1 = document.createElement("p");
        meta1.className = "submission-meta";
        meta1.textContent = `Submitted: ${formatDateTime(item.timestamp)}`;
        card.appendChild(meta1);

        const meta2 = document.createElement("p");
        meta2.className = "submission-meta";
        meta2.textContent = `Score: ${item.assignmentMarks ?? 0}% | Quiz: ${item.quizScore ?? 0}% | Points: ${item.points ?? 0}%`;
        card.appendChild(meta2);

        const answerList = document.createElement("ol");
        answerList.className = "submission-answers";
        const answers = Array.isArray(item.answers) ? item.answers : [];

        answers.forEach((answer) => {
            const li = document.createElement("li");
            li.textContent = `${answer.question} | Answer: ${answer.selectedOption}`;
            answerList.appendChild(li);
        });

        if (!answers.length) {
            const li = document.createElement("li");
            li.textContent = "No detailed answer choices recorded.";
            answerList.appendChild(li);
        }

        card.appendChild(answerList);
        submissionsGrid.appendChild(card);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("eduaiCurrentUser");
        localStorage.removeItem("eduaiUserRole");
        window.location.href = "Frontend.html";
    });
}

renderSubmissions();
