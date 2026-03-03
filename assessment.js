const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");
const assessmentForm = document.getElementById("assessmentForm");
const intentResult = document.getElementById("intentResult");
const recommendationList = document.getElementById("recommendationList");
const mlModelInfo = document.getElementById("mlModelInfo");
const improvementSuggestionsList = document.getElementById("improvementSuggestions");
const assessmentSummary = document.getElementById("assessmentSummary");
const consentCheck = document.getElementById("consentCheck");
const complianceMsg = document.getElementById("complianceMsg");
const quizQuestionSet = document.getElementById("quizQuestionSet");
const assignmentQuestionSet = document.getElementById("assignmentQuestionSet");
const quizScoreInput = document.getElementById("quizScore");
const assignmentMarksInput = document.getElementById("assignmentMarks");
const subjectInterestInput = document.getElementById("subjectInterest");

const ANALYZER_STORAGE_KEY = "eduaiAnalyzerState";
const CONSENT_STORAGE_KEY = "eduaiConsentAccepted";

const studentEmail = localStorage.getItem("eduaiCurrentUser") || "student@eduai.com";
const studentName = studentEmail.split("@")[0];
welcomeUser.textContent = studentName;

const featureIndex = {
    mathematics: 0,
    programming: 1,
    analytics: 2,
    ai: 3,
    visual: 4,
    reading: 5,
    handson: 6,
    certification: 7,
    lowSupport: 8,
    advanced: 9
};

const courseCatalog = [
    { name: "Foundations of Algebra", vector: [0.95, 0.1, 0.2, 0, 0.3, 0.4, 0.2, 0, 0.6, 0.1], level: "school" },
    { name: "School Geometry Essentials", vector: [0.92, 0.1, 0.2, 0, 0.5, 0.4, 0.2, 0, 0.7, 0.1], level: "school" },
    { name: "Fractions and Ratio Mastery", vector: [0.9, 0.1, 0.2, 0, 0.3, 0.5, 0.2, 0, 0.7, 0.1], level: "school" },
    { name: "Programming Fundamentals", vector: [0.1, 0.95, 0.2, 0.1, 0.2, 0.3, 0.7, 0, 0.6, 0.2], level: "school" },
    { name: "Scratch to Python Bridge", vector: [0.1, 0.9, 0.2, 0.1, 0.3, 0.3, 0.8, 0, 0.7, 0.2], level: "school" },
    { name: "Coding Logic Drills for School", vector: [0.1, 0.88, 0.2, 0.1, 0.2, 0.4, 0.7, 0, 0.7, 0.2], level: "school" },
    { name: "Statistics Basics", vector: [0.2, 0.2, 0.95, 0.1, 0.2, 0.7, 0.2, 0, 0.6, 0.1], level: "school" },
    { name: "School Data Interpretation Basics", vector: [0.2, 0.2, 0.9, 0.1, 0.6, 0.5, 0.3, 0, 0.7, 0.1], level: "school" },
    { name: "Probability for Beginners", vector: [0.2, 0.2, 0.88, 0.1, 0.3, 0.6, 0.2, 0, 0.7, 0.1], level: "school" },
    { name: "AI Ethics for School Students", vector: [0.1, 0.4, 0.3, 0.85, 0.3, 0.5, 0.3, 0.1, 0.7, 0.2], level: "school" },
    { name: "Smart Systems Basics", vector: [0.1, 0.45, 0.3, 0.82, 0.2, 0.5, 0.4, 0.1, 0.6, 0.2], level: "school" },
    { name: "School Study Skills Bootcamp", vector: [0.2, 0.2, 0.3, 0.2, 0.2, 0.5, 0.4, 0.3, 0.8, 0.2], level: "school" },
    { name: "Exam Revision Sprint", vector: [0.2, 0.3, 0.4, 0.2, 0.2, 0.4, 0.4, 0.8, 0.6, 0.3], level: "school" }
];

const questionBank = {
    mathematics: {
        quiz: [
            { q: "What is 15% of 200?", options: ["20", "25", "30", "40"], answer: 2 },
            { q: "Solve: 7x = 56", options: ["6", "7", "8", "9"], answer: 2 },
            { q: "Area of rectangle 8 x 5 is", options: ["13", "30", "40", "45"], answer: 2 }
        ],
        assignment: [
            { q: "Which is a prime number?", options: ["21", "27", "29", "39"], answer: 2 },
            { q: "Simplify: 3/4 + 1/4", options: ["1/2", "1", "3/8", "4/8"], answer: 1 },
            { q: "Perimeter of square with side 6", options: ["12", "18", "24", "36"], answer: 2 }
        ]
    },
    programming: {
        quiz: [
            { q: "Which keyword defines a function in Python?", options: ["func", "define", "def", "lambda"], answer: 2 },
            { q: "What is the index of first list element?", options: ["0", "1", "-1", "Depends"], answer: 0 },
            { q: "Loop used for fixed iterations", options: ["for", "while", "if", "switch"], answer: 0 }
        ],
        assignment: [
            { q: "Which data type stores True/False?", options: ["int", "bool", "str", "list"], answer: 1 },
            { q: "Result of 3 + 2 * 2", options: ["10", "7", "8", "9"], answer: 1 },
            { q: "Best structure for ordered items", options: ["set", "dict", "list", "tuple only"], answer: 2 }
        ]
    },
    analytics: {
        quiz: [
            { q: "Mean of 2, 4, 6 is", options: ["3", "4", "5", "6"], answer: 1 },
            { q: "Graph for parts of whole", options: ["Line", "Bar", "Pie", "Scatter"], answer: 2 },
            { q: "Median of 3, 8, 9", options: ["3", "8", "9", "20"], answer: 1 }
        ],
        assignment: [
            { q: "Probability value range", options: ["0 to 1", "1 to 10", "-1 to 1", "0 to 100"], answer: 0 },
            { q: "Outlier means", options: ["Typical value", "Very high/low unusual value", "Average", "Missing value"], answer: 1 },
            { q: "Best chart for category compare", options: ["Bar chart", "Pie chart", "Histogram", "Area chart"], answer: 0 }
        ]
    },
    ai: {
        quiz: [
            { q: "AI system learns from", options: ["Only rules", "Data", "Battery", "Color"], answer: 1 },
            { q: "Model prediction quality is measured by", options: ["Accuracy", "Brightness", "Volume", "Pixels"], answer: 0 },
            { q: "Bias in AI can come from", options: ["Good data", "Biased data", "Fast CPU", "UI design"], answer: 1 }
        ],
        assignment: [
            { q: "Which is supervised learning task?", options: ["Clustering", "Classification", "Random typing", "Compression"], answer: 1 },
            { q: "Ethical AI requires", options: ["Fairness", "Secrecy", "No testing", "No data"], answer: 0 },
            { q: "Overfitting means", options: ["Learns training data too closely", "Learns nothing", "Runs slowly", "Uses low memory"], answer: 0 }
        ]
    },
    english: {
        quiz: [
            { q: "Choose the correct sentence", options: ["He go to school", "He goes to school", "He going school", "He gone school"], answer: 1 },
            { q: "Synonym of 'rapid'", options: ["slow", "quick", "dull", "late"], answer: 1 },
            { q: "Main idea of a paragraph means", options: ["small detail", "central point", "author name", "title font"], answer: 1 }
        ],
        assignment: [
            { q: "Correct punctuation", options: ["Lets eat kids", "Lets eat, kids", "Let's eat, kids", "Lets, eat kids"], answer: 2 },
            { q: "Antonym of 'include'", options: ["contain", "exclude", "collect", "accept"], answer: 1 },
            { q: "A noun is", options: ["action word", "name of person/place/thing", "describing word", "joining word"], answer: 1 }
        ]
    },
    science: {
        quiz: [
            { q: "Water boils at (sea level)", options: ["50C", "75C", "100C", "120C"], answer: 2 },
            { q: "Plant food making process", options: ["Respiration", "Photosynthesis", "Evaporation", "Digestion"], answer: 1 },
            { q: "SI unit of force", options: ["Joule", "Newton", "Watt", "Pascal"], answer: 1 }
        ],
        assignment: [
            { q: "Earth revolves around", options: ["Moon", "Mars", "Sun", "Venus"], answer: 2 },
            { q: "Acid turns blue litmus", options: ["Red", "Green", "Yellow", "Black"], answer: 0 },
            { q: "Gas needed for combustion", options: ["Nitrogen", "Hydrogen", "Oxygen", "Helium"], answer: 2 }
        ]
    },
    social: {
        quiz: [
            { q: "Democracy means", options: ["Rule by one", "Rule by people", "Rule by army", "Rule by court"], answer: 1 },
            { q: "Map scale helps to", options: ["Cook food", "Measure distance on map", "Read stories", "Paint"], answer: 1 },
            { q: "Fundamental rights are", options: ["Optional", "Basic rights for citizens", "Tax rules", "Exam rules"], answer: 1 }
        ],
        assignment: [
            { q: "Panchayati Raj relates to", options: ["Local governance", "Space science", "Music", "Medicine"], answer: 0 },
            { q: "Constitution defines", options: ["Recipes", "Basic laws", "Poems", "Games"], answer: 1 },
            { q: "Savings and budgeting belong to", options: ["Civics", "Economics", "Biology", "Chemistry"], answer: 1 }
        ]
    }
};
const RESOURCE_SUBJECT_BY_ID = {
    r1: "mathematics", r2: "mathematics", r9: "mathematics", r10: "mathematics",
    r3: "programming", r4: "programming", r11: "programming", r12: "programming",
    r5: "analytics", r6: "analytics", r13: "analytics", r14: "analytics",
    r7: "ai", r8: "ai", r15: "ai", r16: "ai",
    r17: "general", r18: "general", r19: "general",
    r20: "social", r21: "english", r22: "english", r23: "science",
    r24: "certification", r25: "certification", r26: "certification"
};
const urlParams = new URLSearchParams(window.location.search);
const quizFromEnrolled = urlParams.get("from") === "enrolled";
const shouldGoToAssignment = urlParams.get("next") === "assignment";
let activeQuestionProfile = { quiz: [], assignment: [] };
let activeQuizSubjects = [];

function syncConsentMessage(isChecked) {
    if (!complianceMsg) {
        return;
    }
    complianceMsg.textContent = isChecked
        ? "Consent confirmed. Compliance checks passed."
        : "Consent required before recommendation release.";
}

function normalizeSubjectForModel(subject) {
    const value = String(subject || "").toLowerCase();
    if (value === "physics" || value === "chemistry" || value === "science") {
        return "analytics";
    }
    if (value === "english" || value === "social") {
        return "mathematics";
    }
    return value;
}

function normalizeSubjectForQuestions(subject) {
    const value = String(subject || "").toLowerCase();
    if (value === "physics" || value === "chemistry") {
        return "science";
    }
    return value;
}

function lowerCaseSafe(value) {
    return (value || "").toLowerCase();
}

function calculateAcademicScore(quizScore, assignmentMarks) {
    return Math.round((quizScore * 0.6) + (assignmentMarks * 0.4));
}

function derivePerformanceFromScores(quizScore, assignmentMarks) {
    const academicScore = calculateAcademicScore(quizScore, assignmentMarks);
    if (academicScore >= 80) {
        return "high";
    }
    if (academicScore < 60) {
        return "low";
    }
    return "medium";
}

function detectIntent({ query, certification, performance, quizScore, assignmentMarks }) {
    const normalizedQuery = lowerCaseSafe(query);
    const academicScore = calculateAcademicScore(quizScore, assignmentMarks);
    if (certification || normalizedQuery.includes("certification") || normalizedQuery.includes("exam")) {
        return "Certification preparation";
    }
    if (
        performance === "low"
        || academicScore < 60
        || normalizedQuery.includes("improve")
        || normalizedQuery.includes("weak")
        || normalizedQuery.includes("struggle")
        || normalizedQuery.includes("difficult")
        || normalizedQuery.includes("poor")
    ) {
        return "Skill assessment";
    }
    if (
        normalizedQuery.includes("explore")
        || normalizedQuery.includes("learn about")
        || normalizedQuery.includes("topic")
        || normalizedQuery.includes("introduction")
        || normalizedQuery.includes("basics")
    ) {
        return "Topic exploration";
    }
    return "Structured upskilling plan";
}

function cosineSimilarity(vecA, vecB) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i += 1) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (!normA || !normB) {
        return 0;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function buildUserVector({ subject, style, intent, performance, quizScore, assignmentMarks }) {
    const academicScore = calculateAcademicScore(quizScore, assignmentMarks);
    const vector = new Array(10).fill(0);
    const mappedSubject = normalizeSubjectForModel(subject);
    if (featureIndex[mappedSubject] !== undefined) {
        vector[featureIndex[mappedSubject]] = 1;
    }
    if (style === "mixed") {
        vector[featureIndex.visual] = 0.45;
        vector[featureIndex.reading] = 0.45;
        vector[featureIndex.handson] = 0.45;
    } else if (featureIndex[style] !== undefined) {
        vector[featureIndex[style]] = 1;
    }
    if (intent === "Certification preparation") {
        vector[featureIndex.certification] = 1;
    }
    if (performance === "low" || academicScore < 60) {
        vector[featureIndex.lowSupport] = 1;
    }
    if (performance === "high" || academicScore > 80) {
        vector[featureIndex.advanced] = 1;
    }
    return vector;
}

function recommendWithML({ grade, subject, intent, performance, quizScore, assignmentMarks, userVector }) {
    const academicScore = calculateAcademicScore(quizScore, assignmentMarks);
    const mappedSubject = normalizeSubjectForModel(subject);
    return courseCatalog
        .map((course) => {
            let score = cosineSimilarity(userVector, course.vector);
            if (course.level === grade) {
                score += 0.2;
            }
            if (mappedSubject === "mathematics" && course.name.toLowerCase().includes("algebra")) {
                score += 0.1;
            }
            if (mappedSubject === "programming" && course.name.toLowerCase().includes("program")) {
                score += 0.1;
            }
            if (mappedSubject === "analytics" && (course.name.toLowerCase().includes("data") || course.name.toLowerCase().includes("statistics"))) {
                score += 0.1;
            }
            if (mappedSubject === "ai" && course.name.toLowerCase().includes("ai")) {
                score += 0.1;
            }
            if (intent === "Certification preparation" && course.name.toLowerCase().includes("exam")) {
                score += 0.14;
            }
            if (performance === "low" || academicScore < 60) {
                if (course.name.toLowerCase().includes("foundations") || course.name.toLowerCase().includes("beginners")) {
                    score += 0.1;
                }
            }
            return { name: course.name, score: Math.max(0, Math.min(score, 1.9)) };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}

function renderRecommendationResults(recommendations) {
    const confidence = Math.min(100, Math.round(((recommendations[0]?.score || 0) / 1.5) * 100));
    mlModelInfo.textContent = `ML model: cosine similarity ranking over ${courseCatalog.length} courses. Top-match confidence: ${confidence}%.`;
    recommendationList.innerHTML = "";
    recommendations.forEach((item) => {
        const li = document.createElement("li");
        const normalizedScore = Math.min(100, Math.round((item.score / 1.5) * 100));
        li.textContent = `${item.name} (${normalizedScore}% match)`;
        recommendationList.appendChild(li);
    });
}

function renderImprovementSuggestions({ subject, performance, quizScore, assignmentMarks, intent, recommendations }) {
    const tips = [];
    const focusCourse = recommendations?.[0]?.name || "top recommended course";
    const academicScore = calculateAcademicScore(quizScore, assignmentMarks);
    if (performance === "low" || academicScore < 60) {
        tips.push(`Start with 30 minutes daily on ${subject} fundamentals.`);
        tips.push("Take two short quizzes per week and review mistakes.");
    } else if (performance === "high" || academicScore > 80) {
        tips.push(`Increase challenge level in ${subject} with timed sets.`);
        tips.push("Add one advanced practice module every week.");
    } else {
        tips.push(`Maintain consistent ${subject} practice: 45 minutes study + 15 minutes recap.`);
        tips.push("Use weekly checkpoints to track progress.");
    }
    if (intent === "Certification preparation") {
        tips.push("Follow a mock-test cycle: attempt, review, and repeat with stricter time.");
    }
    tips.push(`Complete the top recommendation first: ${focusCourse}.`);

    improvementSuggestionsList.innerHTML = "";
    tips.slice(0, 5).forEach((tip) => {
        const li = document.createElement("li");
        li.textContent = tip;
        improvementSuggestionsList.appendChild(li);
    });
}

function renderQuestionSet(container, groupName, questions) {
    if (!container) {
        return;
    }
    container.innerHTML = "";
    questions.forEach((item, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "form-row";

        const title = document.createElement("p");
        title.className = "hint";
        title.textContent = `${index + 1}. ${item.q}`;
        wrapper.appendChild(title);

        item.options.forEach((option, optionIndex) => {
            const label = document.createElement("label");
            label.className = "inline-check";
            label.innerHTML = `<input type="radio" name="${groupName}_${index}" value="${optionIndex}"> ${option}`;
            wrapper.appendChild(label);
        });

        container.appendChild(wrapper);
    });
}

function evaluateQuestionSet(groupName, questions) {
    let correct = 0;
    let answered = 0;
    questions.forEach((item, index) => {
        const selected = document.querySelector(`input[name="${groupName}_${index}"]:checked`);
        if (!selected) {
            return;
        }
        answered += 1;
        if (Number(selected.value) === item.answer) {
            correct += 1;
        }
    });

    if (!questions.length) {
        return { score: 0, answered: 0, total: 0 };
    }

    return {
        score: Math.round((correct / questions.length) * 100),
        answered,
        total: questions.length
    };
}

function getQuestionProfile(subject) {
    const normalized = normalizeSubjectForQuestions(subject);
    return questionBank[normalized] || questionBank.mathematics;
}

function parseSubjectsFromQuery() {
    const raw = String(urlParams.get("subjects") || "").trim();
    if (!raw) {
        return [];
    }
    return raw
        .split(",")
        .map((item) => normalizeSubjectForQuestions(item))
        .filter((item) => Boolean(questionBank[item]));
}

function getEnrolledSubjectsFromStorage() {
    let payload = {};
    try {
        payload = JSON.parse(localStorage.getItem(ANALYZER_STORAGE_KEY) || "{}");
    } catch {
        payload = {};
    }

    const enrolledIds = Array.isArray(payload.enrolledIds) ? payload.enrolledIds : [];
    return enrolledIds
        .map((id) => normalizeSubjectForQuestions(RESOURCE_SUBJECT_BY_ID[id]))
        .filter((subject) => Boolean(questionBank[subject]));
}

function buildQuestionsBySubjects(subjects, type, count) {
    const uniqueSubjects = Array.from(new Set(subjects));
    const selected = [];
    let cursor = 0;

    while (selected.length < count && uniqueSubjects.length > 0) {
        const currentSubject = uniqueSubjects[cursor % uniqueSubjects.length];
        const bank = questionBank[currentSubject]?.[type] || [];
        const indexInBank = Math.floor(cursor / uniqueSubjects.length);
        if (indexInBank < bank.length) {
            selected.push(bank[indexInBank]);
        }
        cursor += 1;
        if (cursor > 40) {
            break;
        }
    }

    if (selected.length < count && uniqueSubjects.length > 0) {
        const fallbackBank = questionBank[uniqueSubjects[0]]?.[type] || [];
        for (let i = 0; i < fallbackBank.length && selected.length < count; i += 1) {
            if (!selected.includes(fallbackBank[i])) {
                selected.push(fallbackBank[i]);
            }
        }
    }

    return selected.slice(0, count);
}

function getQuestionProfileFromEnrolled(subject) {
    const querySubjects = parseSubjectsFromQuery();
    const storageSubjects = getEnrolledSubjectsFromStorage();
    const normalizedSubject = normalizeSubjectForQuestions(subject);
    const merged = Array.from(new Set([...querySubjects, ...storageSubjects, normalizedSubject]))
        .filter((item) => Boolean(questionBank[item]));

    const effectiveSubjects = merged.length ? merged : ["mathematics"];
    activeQuizSubjects = effectiveSubjects;
    return {
        quiz: buildQuestionsBySubjects(effectiveSubjects, "quiz", 3),
        assignment: buildQuestionsBySubjects(effectiveSubjects, "assignment", 3)
    };
}

function renderQuestionBanksForSubject(subject) {
    activeQuestionProfile = quizFromEnrolled
        ? getQuestionProfileFromEnrolled(subject)
        : getQuestionProfile(subject);

    renderQuestionSet(quizQuestionSet, "quiz", activeQuestionProfile.quiz);
    renderQuestionSet(assignmentQuestionSet, "assignment", activeQuestionProfile.assignment);
    if (quizScoreInput) {
        quizScoreInput.value = "";
    }
    if (assignmentMarksInput) {
        assignmentMarksInput.value = "";
    }

    if (quizFromEnrolled && activeQuizSubjects.length) {
        assessmentSummary.textContent = `Quiz generated from enrolled subjects: ${activeQuizSubjects.join(", ")}.`;
    }
}

function saveAssessmentRecord(record) {
    let payload = {};
    try {
        payload = JSON.parse(localStorage.getItem(ANALYZER_STORAGE_KEY) || "{}");
    } catch {
        payload = {};
    }

    const assessments = Array.isArray(payload.assessments) ? payload.assessments : [];
    assessments.push(record);
    if (assessments.length > 100) {
        assessments.splice(0, assessments.length - 100);
    }
    payload.assessments = assessments;

    localStorage.setItem(ANALYZER_STORAGE_KEY, JSON.stringify(payload));
}

function getWorkflowSubjectsParam() {
    const raw = String(urlParams.get("subjects") || "").trim();
    return raw ? encodeURIComponent(raw) : "";
}

if (subjectInterestInput) {
    if (quizFromEnrolled) {
        const preselected = parseSubjectsFromQuery()[0] || getEnrolledSubjectsFromStorage()[0] || "mathematics";
        subjectInterestInput.value = preselected;
    }
    subjectInterestInput.addEventListener("change", () => {
        renderQuestionBanksForSubject(subjectInterestInput.value);
    });
    renderQuestionBanksForSubject(subjectInterestInput.value || "mathematics");
}

if (consentCheck) {
    consentCheck.checked = localStorage.getItem(CONSENT_STORAGE_KEY) === "true";
    syncConsentMessage(consentCheck.checked);
    consentCheck.addEventListener("change", () => {
        localStorage.setItem(CONSENT_STORAGE_KEY, consentCheck.checked ? "true" : "false");
        syncConsentMessage(consentCheck.checked);
    });
}

assessmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const grade = "school";
    const subject = document.getElementById("subjectInterest").value;
    const style = document.getElementById("learningStyle").value;
    const performanceInput = document.getElementById("performance");
    const rawQuery = document.getElementById("textQuery").value.trim();
    const certification = document.getElementById("goalCertification").checked;

    const quizEval = evaluateQuestionSet("quiz", activeQuestionProfile.quiz);
    const assignmentEval = evaluateQuestionSet("assignment", activeQuestionProfile.assignment);

    if (!subject || !style || !performance) {
        assessmentSummary.textContent = "Assessment blocked: fill subject, learning style, and performance.";
        return;
    }

    if (quizEval.answered < quizEval.total || assignmentEval.answered < assignmentEval.total) {
        assessmentSummary.textContent = "Assessment blocked: answer all quiz and assignment questions to generate marks.";
        return;
    }

    const quizScore = quizEval.score;
    const assignmentMarks = assignmentEval.score;
    if (quizScoreInput) {
        quizScoreInput.value = String(quizScore);
    }
    if (assignmentMarksInput) {
        assignmentMarksInput.value = String(assignmentMarks);
    }

    const query = rawQuery || `Need help in ${subject} with quiz ${quizScore} and assignment ${assignmentMarks}`;
    const academicScore = calculateAcademicScore(quizScore, assignmentMarks);
    const performance = derivePerformanceFromScores(quizScore, assignmentMarks);
    if (performanceInput) {
        performanceInput.value = performance;
    }

    if (!consentCheck.checked) {
        syncConsentMessage(false);
        assessmentSummary.textContent = "Assessment blocked: please check consent.";
        return;
    }

    syncConsentMessage(true);
    const intent = detectIntent({ query, certification, performance, quizScore, assignmentMarks });
    const userVector = buildUserVector({ subject, style, intent, performance, quizScore, assignmentMarks });
    const recommendations = recommendWithML({
        grade,
        subject,
        intent,
        performance,
        quizScore,
        assignmentMarks,
        userVector
    });

    const record = {
        subject,
        quizScore,
        assignmentMarks,
        points: academicScore,
        performance,
        query,
        timestamp: new Date().toISOString()
    };
    saveAssessmentRecord(record);

    intentResult.textContent = `Detected intent: ${intent}`;
    assessmentSummary.textContent = `Assessment summary: ${grade} learner, subject ${subject}, ${style} style, ${performance} performance, quiz ${quizScore}%, assignment ${assignmentMarks}%, academic score ${academicScore}%.`;
    renderRecommendationResults(recommendations);
    renderImprovementSuggestions({ subject, performance, quizScore, assignmentMarks, intent, recommendations });

    if (shouldGoToAssignment) {
        const encodedSubjects = getWorkflowSubjectsParam();
        const target = encodedSubjects
            ? `Assignment.html?from=enrolled&subjects=${encodedSubjects}`
            : "Assignment.html?from=enrolled";
        window.location.href = target;
    }
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("eduaiCurrentUser");
    window.location.href = "Frontend.html";
});
