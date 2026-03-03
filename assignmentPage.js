const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");
const assignmentForm = document.getElementById("assignmentForm");
const subjectInterestInput = document.getElementById("subjectInterest");
const quizScoreInput = document.getElementById("quizScore");
const assignmentMarksInput = document.getElementById("assignmentMarks");
const assignmentQuestionSet = document.getElementById("assignmentQuestionSet");
const assignmentSummary = document.getElementById("assignmentSummary");
const consentCheck = document.getElementById("consentCheck");
const selectedSubjectsPanel = document.getElementById("selectedSubjectsPanel");

const ANALYZER_STORAGE_KEY = "eduaiAnalyzerState";
const studentEmail = localStorage.getItem("eduaiCurrentUser") || "student@eduai.com";
welcomeUser.textContent = studentEmail.split("@")[0];

const RESOURCE_SUBJECT_BY_ID = {
    r1: "mathematics", r2: "mathematics", r9: "mathematics", r10: "mathematics",
    r3: "programming", r4: "programming", r11: "programming", r12: "programming",
    r5: "analytics", r6: "analytics", r13: "analytics", r14: "analytics",
    r7: "ai", r8: "ai", r15: "ai", r16: "ai",
    r17: "general", r18: "general", r19: "general",
    r20: "social", r21: "english", r22: "english", r23: "science",
    r24: "certification", r25: "certification", r26: "certification"
};

const assignmentBank = {
    mathematics: [
        { q: "Which is a prime number?", options: ["21", "27", "29", "39"], answer: 2 },
        { q: "Simplify: 3/4 + 1/4", options: ["1/2", "1", "3/8", "4/8"], answer: 1 },
        { q: "Perimeter of square with side 6", options: ["12", "18", "24", "36"], answer: 2 }
    ],
    programming: [
        { q: "Which data type stores True/False?", options: ["int", "bool", "str", "list"], answer: 1 },
        { q: "Result of 3 + 2 * 2", options: ["10", "7", "8", "9"], answer: 1 },
        { q: "Best structure for ordered items", options: ["set", "dict", "list", "tuple only"], answer: 2 }
    ],
    analytics: [
        { q: "Probability value range", options: ["0 to 1", "1 to 10", "-1 to 1", "0 to 100"], answer: 0 },
        { q: "Outlier means", options: ["Typical value", "Very high/low unusual value", "Average", "Missing value"], answer: 1 },
        { q: "Best chart for category compare", options: ["Bar chart", "Pie chart", "Histogram", "Area chart"], answer: 0 }
    ],
    ai: [
        { q: "Which is supervised learning task?", options: ["Clustering", "Classification", "Random typing", "Compression"], answer: 1 },
        { q: "Ethical AI requires", options: ["Fairness", "Secrecy", "No testing", "No data"], answer: 0 },
        { q: "Overfitting means", options: ["Learns training data too closely", "Learns nothing", "Runs slowly", "Uses low memory"], answer: 0 }
    ],
    english: [
        { q: "Correct punctuation", options: ["Lets eat kids", "Lets eat, kids", "Let's eat, kids", "Lets, eat kids"], answer: 2 },
        { q: "Antonym of 'include'", options: ["contain", "exclude", "collect", "accept"], answer: 1 },
        { q: "A noun is", options: ["action word", "name of person/place/thing", "describing word", "joining word"], answer: 1 }
    ],
    science: [
        { q: "Earth revolves around", options: ["Moon", "Mars", "Sun", "Venus"], answer: 2 },
        { q: "Acid turns blue litmus", options: ["Red", "Green", "Yellow", "Black"], answer: 0 },
        { q: "Gas needed for combustion", options: ["Nitrogen", "Hydrogen", "Oxygen", "Helium"], answer: 2 }
    ],
    social: [
        { q: "Panchayati Raj relates to", options: ["Local governance", "Space science", "Music", "Medicine"], answer: 0 },
        { q: "Constitution defines", options: ["Recipes", "Basic laws", "Poems", "Games"], answer: 1 },
        { q: "Savings and budgeting belong to", options: ["Civics", "Economics", "Biology", "Chemistry"], answer: 1 }
    ]
};

const urlParams = new URLSearchParams(window.location.search);
const fromEnrolled = urlParams.get("from") === "enrolled";
let activeQuestions = [];
let selectedSubjects = [];

function normalizeSubject(subject) {
    const value = String(subject || "").toLowerCase();
    if (value === "physics" || value === "chemistry") {
        return "science";
    }
    return value;
}

function calculateAcademicScore(quizScore, assignmentMarks) {
    return Math.round((quizScore * 0.6) + (assignmentMarks * 0.4));
}

function readPayload() {
    try {
        return JSON.parse(localStorage.getItem(ANALYZER_STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
}

function writePayload(payload) {
    localStorage.setItem(ANALYZER_STORAGE_KEY, JSON.stringify(payload));
}

function getEnrolledSubjectsFromPayload() {
    const payload = readPayload();
    const ids = Array.isArray(payload.enrolledIds) ? payload.enrolledIds : [];
    return ids
        .map((id) => normalizeSubject(RESOURCE_SUBJECT_BY_ID[id]))
        .filter((item) => Boolean(assignmentBank[item]));
}

function getSubjectsFromQuery() {
    const raw = String(urlParams.get("subjects") || "");
    return raw
        .split(",")
        .map((item) => normalizeSubject(item))
        .filter((item) => Boolean(assignmentBank[item]));
}

function buildQuestionsForSubjects(subjects, count) {
    const unique = Array.from(new Set(subjects));
    const selected = [];
    let turn = 0;
    while (selected.length < count && unique.length) {
        const current = unique[turn % unique.length];
        const bank = assignmentBank[current] || [];
        const offset = Math.floor(turn / unique.length);
        if (offset < bank.length) {
            selected.push(bank[offset]);
        }
        turn += 1;
        if (turn > 50) {
            break;
        }
    }
    return selected.slice(0, count);
}

function normalizeSubjectList(subjects) {
    return Array.from(new Set(subjects.map((item) => normalizeSubject(item)).filter((item) => Boolean(assignmentBank[item]))));
}

function renderSubjectSelection(subjects) {
    if (!selectedSubjectsPanel) {
        return;
    }
    selectedSubjectsPanel.innerHTML = "";
    const normalized = normalizeSubjectList(subjects);
    if (!normalized.length) {
        selectedSubjectsPanel.innerHTML = "<p class=\"hint\">No selectable subjects found. Using selected subject only.</p>";
        return;
    }

    normalized.forEach((subject) => {
        const label = document.createElement("label");
        label.className = "inline-check";
        label.innerHTML = `<input type="checkbox" value="${subject}" checked> ${subject}`;
        selectedSubjectsPanel.appendChild(label);
    });
}

function getSelectedSubjectsFromPanel() {
    if (!selectedSubjectsPanel) {
        return [];
    }
    return Array.from(selectedSubjectsPanel.querySelectorAll("input[type=\"checkbox\"]:checked"))
        .map((input) => normalizeSubject(input.value))
        .filter((item) => Boolean(assignmentBank[item]));
}

function renderQuestions(questions) {
    assignmentQuestionSet.innerHTML = "";
    questions.forEach((item, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "form-row";
        const questionText = document.createElement("p");
        questionText.className = "hint";
        questionText.textContent = `${index + 1}. ${item.q}`;
        wrapper.appendChild(questionText);

        item.options.forEach((option, optionIndex) => {
            const label = document.createElement("label");
            label.className = "inline-check";
            label.innerHTML = `<input type="radio" name="assignment_${index}" value="${optionIndex}"> ${option}`;
            wrapper.appendChild(label);
        });
        assignmentQuestionSet.appendChild(wrapper);
    });
}

function renderBySubject(subject) {
    const normalized = normalizeSubject(subject);
    const availableSubjects = fromEnrolled
        ? normalizeSubjectList([...getSubjectsFromQuery(), ...getEnrolledSubjectsFromPayload(), normalized])
        : normalizeSubjectList([normalized]);

    if (!selectedSubjects.length) {
        selectedSubjects = availableSubjects.length ? availableSubjects : [normalized];
    }

    renderSubjectSelection(availableSubjects.length ? availableSubjects : selectedSubjects);

    const userSelected = getSelectedSubjectsFromPanel();
    selectedSubjects = userSelected.length ? userSelected : (availableSubjects.length ? availableSubjects : [normalized]);

    activeQuestions = buildQuestionsForSubjects(selectedSubjects, 3);
    if (!activeQuestions.length) {
        activeQuestions = assignmentBank.mathematics;
    }
    renderQuestions(activeQuestions);
    assignmentMarksInput.value = "";
    assignmentSummary.textContent = `Assignment generated from: ${selectedSubjects.join(", ")}.`;
}

function getLatestQuizForSubject(subject) {
    const normalized = normalizeSubject(subject);
    const payload = readPayload();
    const assessments = Array.isArray(payload.assessments) ? payload.assessments : [];
    for (let i = assessments.length - 1; i >= 0; i -= 1) {
        const item = assessments[i];
        if (normalizeSubject(item?.subject) === normalized) {
            const value = Number(item?.quizScore);
            if (Number.isFinite(value)) {
                return Math.max(0, Math.min(100, value));
            }
        }
    }
    return null;
}

function evaluateAssignment() {
    let correct = 0;
    let answered = 0;
    activeQuestions.forEach((item, index) => {
        const selected = document.querySelector(`input[name="assignment_${index}"]:checked`);
        if (!selected) {
            return;
        }
        answered += 1;
        if (Number(selected.value) === item.answer) {
            correct += 1;
        }
    });
    return {
        answered,
        total: activeQuestions.length,
        score: activeQuestions.length ? Math.round((correct / activeQuestions.length) * 100) : 0
    };
}

if (subjectInterestInput) {
    const subjects = fromEnrolled
        ? Array.from(new Set([...getSubjectsFromQuery(), ...getEnrolledSubjectsFromPayload()]))
        : [];
    if (subjects.length) {
        subjectInterestInput.value = subjects[0];
        selectedSubjects = subjects;
    }
    subjectInterestInput.addEventListener("change", () => renderBySubject(subjectInterestInput.value));
    renderBySubject(subjectInterestInput.value || "mathematics");
}

if (selectedSubjectsPanel) {
    selectedSubjectsPanel.addEventListener("change", () => {
        renderBySubject(subjectInterestInput?.value || "mathematics");
    });
}

if (assignmentForm) {
    assignmentForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const subject = subjectInterestInput.value;
        if (!subject) {
            assignmentSummary.textContent = "Select a subject before evaluating assignment.";
            return;
        }
        if (!consentCheck.checked) {
            assignmentSummary.textContent = "Consent required to process assignment marks.";
            return;
        }

        const result = evaluateAssignment();
        if (result.answered < result.total) {
            assignmentSummary.textContent = "Answer all assignment questions before calculating marks.";
            return;
        }

        const assignmentMarks = result.score;
        assignmentMarksInput.value = String(assignmentMarks);

        const priorQuiz = getLatestQuizForSubject(subject);
        const quizScore = priorQuiz === null ? assignmentMarks : priorQuiz;
        quizScoreInput.value = String(quizScore);
        const points = calculateAcademicScore(quizScore, assignmentMarks);

        const payload = readPayload();
        const assessments = Array.isArray(payload.assessments) ? payload.assessments : [];
        assessments.push({
            subject: normalizeSubject(subject),
            quizScore,
            assignmentMarks,
            points,
            performance: points >= 80 ? "high" : points < 60 ? "low" : "medium",
            query: `Assignment page evaluation (${selectedSubjects.join(", ")})`,
            timestamp: new Date().toISOString()
        });
        if (assessments.length > 100) {
            assessments.splice(0, assessments.length - 100);
        }
        payload.assessments = assessments;
        writePayload(payload);

        assignmentSummary.textContent = `Assignment marks calculated: ${assignmentMarks}% from [${selectedSubjects.join(", ")}]. Quiz considered: ${quizScore}%. Academic points: ${points}%. Analyzer updated.`;
    });
}

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("eduaiCurrentUser");
    window.location.href = "Frontend.html";
});
