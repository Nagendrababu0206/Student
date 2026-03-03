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

function lowerCaseSafe(value) {
    return (value || "").toLowerCase();
}

function calculateAcademicScore(quizScore, assignmentMarks) {
    return Math.round((quizScore * 0.6) + (assignmentMarks * 0.4));
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
    vector[featureIndex[subject]] = 1;
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
    return courseCatalog
        .map((course) => {
            let score = cosineSimilarity(userVector, course.vector);
            if (course.level === grade) {
                score += 0.2;
            }
            if (subject === "mathematics" && course.name.toLowerCase().includes("algebra")) {
                score += 0.1;
            }
            if (subject === "programming" && course.name.toLowerCase().includes("program")) {
                score += 0.1;
            }
            if (subject === "analytics" && (course.name.toLowerCase().includes("data") || course.name.toLowerCase().includes("statistics"))) {
                score += 0.1;
            }
            if (subject === "ai" && course.name.toLowerCase().includes("ai")) {
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

assessmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const grade = "school";
    const subject = document.getElementById("subjectInterest").value;
    const style = document.getElementById("learningStyle").value;
    const performance = document.getElementById("performance").value;
    const quizScore = Number(document.getElementById("quizScore").value);
    const assignmentMarks = Number(document.getElementById("assignmentMarks").value);
    const rawQuery = document.getElementById("textQuery").value.trim();
    const query = rawQuery || `Need help in ${subject} with quiz ${quizScore} and assignment ${assignmentMarks}`;
    const certification = document.getElementById("goalCertification").checked;
    const academicScore = calculateAcademicScore(quizScore, assignmentMarks);

    if (!subject || !style || !performance || !Number.isFinite(quizScore) || !Number.isFinite(assignmentMarks)) {
        assessmentSummary.textContent = "Assessment blocked: fill subject, learning style, performance, quiz score, and assignment marks.";
        return;
    }
    if (!consentCheck.checked) {
        complianceMsg.textContent = "Consent missing: enable consent to generate recommendations.";
        assessmentSummary.textContent = "Assessment blocked: please check consent.";
        return;
    }

    complianceMsg.textContent = "Consent confirmed. Compliance checks passed.";
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

    intentResult.textContent = `Detected intent: ${intent}`;
    assessmentSummary.textContent = `Assessment summary: ${grade} learner, subject ${subject}, ${style} style, ${performance} performance, quiz ${quizScore}%, assignment ${assignmentMarks}%, academic score ${academicScore}%.`;
    renderRecommendationResults(recommendations);
    renderImprovementSuggestions({ subject, performance, quizScore, assignmentMarks, intent, recommendations });
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("eduaiCurrentUser");
    window.location.href = "Frontend.html";
});
