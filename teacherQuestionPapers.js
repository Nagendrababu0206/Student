const paperGrid = document.getElementById("paperGrid");
const logoutBtn = document.getElementById("logoutBtn");

const questionBank = {
    mathematics: [
        "What is 15% of 200?",
        "Solve: 7x = 56",
        "Area of rectangle 8 x 5",
        "Which is a prime number?",
        "Simplify: 3/4 + 1/4"
    ],
    programming: [
        "Which keyword defines a function in Python?",
        "What is the first list index?",
        "Loop used for fixed iterations",
        "Which data type stores True/False?",
        "Result of 3 + 2 * 2"
    ],
    analytics: [
        "Mean of 2, 4, 6",
        "Graph for parts of whole",
        "Median of 3, 8, 9",
        "Probability value range",
        "Best chart for category compare"
    ],
    ai: [
        "AI system learns from what?",
        "Model prediction quality is measured by?",
        "Bias in AI can come from?",
        "Which is supervised learning task?",
        "Ethical AI requires what?"
    ],
    english: [
        "Choose the correct sentence",
        "Synonym of rapid",
        "Main idea of a paragraph",
        "Correct punctuation",
        "A noun is?"
    ],
    science: [
        "Water boils at (sea level)?",
        "Plant food making process?",
        "SI unit of force?",
        "Earth revolves around?",
        "Gas needed for combustion?"
    ],
    social: [
        "Democracy means?",
        "Map scale helps to?",
        "Fundamental rights are?",
        "Panchayati Raj relates to?",
        "Constitution defines?"
    ]
};

function renderPapers() {
    Object.entries(questionBank).forEach(([subject, questions]) => {
        const card = document.createElement("article");
        card.className = "paper-card";

        const title = document.createElement("h4");
        title.textContent = subject;
        card.appendChild(title);

        const list = document.createElement("ol");
        questions.forEach((question) => {
            const li = document.createElement("li");
            li.textContent = question;
            list.appendChild(li);
        });

        card.appendChild(list);
        paperGrid.appendChild(card);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("eduaiCurrentUser");
        localStorage.removeItem("eduaiUserRole");
        window.location.href = "Frontend.html";
    });
}

renderPapers();
