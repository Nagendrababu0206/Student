const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");
const studyChart = document.getElementById("studyChart");

const assessmentForm = document.getElementById("assessmentForm");
const intentResult = document.getElementById("intentResult");
const recommendationList = document.getElementById("recommendationList");
const mlModelInfo = document.getElementById("mlModelInfo");
const improvementSuggestionsList = document.getElementById("improvementSuggestions");
const assessmentSummary = document.getElementById("assessmentSummary");
const consentCheck = document.getElementById("consentCheck");
const complianceMsg = document.getElementById("complianceMsg");
const submitFeedbackBtn = document.getElementById("submitFeedback");
const feedbackResponse = document.getElementById("feedbackResponse");
const engagementStatus = document.getElementById("engagementStatus");

const openResourcesBtn = document.getElementById("openResources");
const enrollCourseBtn = document.getElementById("enrollCourse");
const trackProgressBtn = document.getElementById("trackProgress");
const resourceFilter = document.getElementById("resourceFilter");
const resourceCatalog = document.getElementById("resourceCatalog");
const enrolledList = document.getElementById("enrolledList");
const completionRate = document.getElementById("completionRate");
const weeklyHours = document.getElementById("weeklyHours");
const streakDays = document.getElementById("streakDays");
const mathProgressBar = document.getElementById("mathProgressBar");
const programmingProgressBar = document.getElementById("programmingProgressBar");
const analyticsProgressBar = document.getElementById("analyticsProgressBar");
const goalDonut = document.getElementById("goalDonut");
const goalPercentValue = document.getElementById("goalPercentValue");
const trendMessage = document.getElementById("trendMessage");

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const liveAiToggle = document.getElementById("liveAiToggle");
const chatApiStatus = document.getElementById("chatApiStatus");
const themeToggleBtn = document.getElementById("themeToggleBtn");

const studentEmail = localStorage.getItem("eduaiCurrentUser") || "student@eduai.com";
const studentName = studentEmail.split("@")[0];
welcomeUser.textContent = studentName;

const weeklyData = [1.8, 2.2, 1.4, 2.8, 2.1, 2.6, 1.6];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let latestAssessment = null;
const enrolledResourceIds = new Set();
const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const LOCAL_API_BASE = "http://localhost:3001";
let remoteApiBase = "";
const THEME_STORAGE_KEY = "eduaiTheme";
const feedbackSignals = {
    concern: "none",
    text: ""
};

function normalizeBackendUrl(value) {
    return String(value || "")
        .trim()
        .replace(/\/+$/, "")
        .replace(/\/api\/health$/i, "")
        .replace(/\/api$/i, "");
}

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
                remoteApiBase = normalizeBackendUrl(payload.backendUrl);
            }
        }
    } catch {
        // Keep proxy fallback below.
    }
    return remoteApiBase;
}

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
    { name: "Applied Problem Solving Lab", vector: [0.8, 0.2, 0.3, 0, 0.2, 0.3, 0.7, 0, 0.3, 0.5], level: "undergraduate" },
    { name: "Programming Fundamentals", vector: [0.1, 0.95, 0.2, 0.1, 0.2, 0.3, 0.7, 0, 0.6, 0.2], level: "school" },
    { name: "Data Structures with Practice", vector: [0, 0.95, 0.3, 0.1, 0.2, 0.3, 0.8, 0, 0.4, 0.6], level: "undergraduate" },
    { name: "Statistics Basics", vector: [0.2, 0.2, 0.95, 0.1, 0.2, 0.7, 0.2, 0, 0.6, 0.1], level: "school" },
    { name: "Data Visualization Studio", vector: [0.1, 0.3, 0.9, 0.1, 0.8, 0.2, 0.4, 0, 0.2, 0.5], level: "undergraduate" },
    { name: "AI Foundations", vector: [0.1, 0.5, 0.3, 0.95, 0.2, 0.5, 0.4, 0.1, 0.3, 0.5], level: "undergraduate" },
    { name: "Machine Learning Concepts", vector: [0, 0.4, 0.7, 0.95, 0.2, 0.6, 0.5, 0.2, 0.2, 0.7], level: "postgraduate" },
    { name: "Certification Mock Test Series", vector: [0.2, 0.4, 0.5, 0.4, 0.1, 0.4, 0.6, 1, 0.2, 0.8], level: "undergraduate" },
    { name: "Diagnostic Quiz Pack and Gap Remediation", vector: [0.2, 0.2, 0.3, 0.1, 0.1, 0.5, 0.3, 0.2, 1, 0.1], level: "school" },
    { name: "Concept Videos and Visual Notes", vector: [0.2, 0.2, 0.3, 0.2, 1, 0.1, 0.2, 0, 0.4, 0.1], level: "school" },
    { name: "Hands-on Assignments and Weekly Projects", vector: [0.1, 0.4, 0.3, 0.2, 0.1, 0.2, 1, 0, 0.3, 0.5], level: "undergraduate" },
    { name: "Beginner Pace Mentor Sessions", vector: [0.2, 0.2, 0.2, 0.2, 0.2, 0.5, 0.3, 0, 1, 0], level: "school" },
    { name: "Revision Tracker and Exam Planner", vector: [0.1, 0.3, 0.4, 0.3, 0.1, 0.4, 0.5, 0.9, 0.2, 0.7], level: "undergraduate" }
];

const resourceLibrary = [
    { id: "r1", subject: "mathematics", title: "Algebra Foundations", type: "Video Module", difficulty: "Beginner", description: "Core algebra concepts with worked school-level examples.", youtube: "https://www.youtube.com/watch?v=AUqeb9Z3y3k" },
    { id: "r2", subject: "mathematics", title: "Geometry Practice Pack", type: "Worksheet", difficulty: "Beginner", description: "Shape, angle, and theorem-based practice questions.", youtube: "https://www.youtube.com/watch?v=302eJ3TzJQU" },
    { id: "r3", subject: "programming", title: "Python Basics for School", type: "Interactive Lab", difficulty: "Beginner", description: "Variables, loops, and functions through guided coding tasks.", youtube: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
    { id: "r4", subject: "programming", title: "Problem Solving with Pseudocode", type: "Reading + Quiz", difficulty: "Beginner", description: "Step-by-step logic building for coding interviews and exams.", youtube: "https://www.youtube.com/watch?v=azcrPFhaY9k" },
    { id: "r5", subject: "analytics", title: "Data Charts and Graph Reading", type: "Video + Quiz", difficulty: "Beginner", description: "Interpret school-level charts, tables, and trend questions.", youtube: "https://www.youtube.com/watch?v=9FtHB7V14Fo" },
    { id: "r6", subject: "analytics", title: "Statistics Essentials", type: "Worksheet", difficulty: "Intermediate", description: "Mean, median, mode, and basic probability drills.", youtube: "https://www.youtube.com/watch?v=xxpc-HPKN28" },
    { id: "r7", subject: "ai", title: "AI for School Students", type: "Concept Module", difficulty: "Beginner", description: "Simple introduction to AI use cases, ethics, and projects.", youtube: "https://www.youtube.com/watch?v=2ePf9rue1Ao" },
    { id: "r8", subject: "ai", title: "Machine Learning Basics", type: "Concept + Activity", difficulty: "Intermediate", description: "Basic model concepts with non-technical classroom examples.", youtube: "https://www.youtube.com/watch?v=ukzFI9rgwfU" }
];

function renderWeeklyChart(data) {
    studyChart.innerHTML = "";
    const maxHours = Math.max(...data, 1);
    data.forEach((hours, index) => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = `${(hours / maxHours) * 100}%`;
        bar.dataset.day = dayLabels[index];
        bar.title = `${dayLabels[index]}: ${hours} hrs`;
        studyChart.appendChild(bar);
    });
}

function updatePerformanceDashboard(subject, performance, quizScore) {
    const score = Math.max(0, Math.min(100, Number(quizScore) || 0));

    const base = {
        mathematics: 68,
        programming: 68,
        analytics: 68
    };
    const performanceDelta = performance === "high" ? 14 : performance === "low" ? -10 : 3;

    if (subject === "mathematics") {
        base.mathematics = score;
    } else if (subject === "programming") {
        base.programming = score;
    } else if (subject === "analytics") {
        base.analytics = score;
    } else if (subject === "ai") {
        base.programming = Math.min(100, score + 6);
        base.analytics = Math.min(100, score + 4);
    }

    const mathScore = Math.max(0, Math.min(100, base.mathematics + performanceDelta));
    const programmingScore = Math.max(0, Math.min(100, base.programming + performanceDelta));
    const analyticsScore = Math.max(0, Math.min(100, base.analytics + performanceDelta));

    mathProgressBar.style.width = `${mathScore}%`;
    programmingProgressBar.style.width = `${programmingScore}%`;
    analyticsProgressBar.style.width = `${analyticsScore}%`;

    const completion = Math.round((mathScore + programmingScore + analyticsScore) / 3);
    completionRate.textContent = `${completion}%`;
    goalPercentValue.textContent = `${completion}%`;
    goalDonut.style.background = `conic-gradient(#0284c7 0 ${completion}%, #e2e8f0 ${completion}% 100%)`;

    const avgHoursPerDay = 1.2 + (completion / 100) * 2.0;
    const generatedWeekly = [0.84, 0.96, 0.9, 1.08, 1, 1.12, 0.86]
        .map((factor) => Number((avgHoursPerDay * factor).toFixed(1)));
    const weeklyTotal = generatedWeekly.reduce((sum, val) => sum + val, 0);

    weeklyHours.textContent = `${weeklyTotal.toFixed(1)} hrs`;
    streakDays.textContent = `${Math.max(3, Math.round(completion / 10))} days`;
    trendMessage.textContent = completion >= 75
        ? "Consistency is improving this week."
        : completion >= 55
            ? "You are progressing steadily. Keep practicing daily."
            : "Consistency is low. Focus on small daily study goals.";

    renderWeeklyChart(generatedWeekly);
}

renderWeeklyChart(weeklyData);

function detectIntent({ query, certification, performance, quizScore }) {
    const normalizedQuery = query.toLowerCase();

    if (certification || normalizedQuery.includes("certification") || normalizedQuery.includes("exam")) {
        return "Certification preparation";
    }

    if (performance === "low" || quizScore < 60 || normalizedQuery.includes("improve") || normalizedQuery.includes("weak")) {
        return "Skill assessment";
    }

    if (normalizedQuery.includes("explore") || normalizedQuery.includes("learn about") || normalizedQuery.includes("topic")) {
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

function buildUserVector({ subject, style, intent, performance, quizScore }) {
    const vector = new Array(10).fill(0);
    vector[featureIndex[subject]] = 1;
    vector[featureIndex[style]] = 1;

    if (intent === "Certification preparation") {
        vector[featureIndex.certification] = 1;
    }
    if (performance === "low" || quizScore < 60) {
        vector[featureIndex.lowSupport] = 1;
    }
    if (performance === "high" || quizScore > 80) {
        vector[featureIndex.advanced] = 1;
    }
    return vector;
}

function parseChatToSchoolProfile(message) {
    const text = message.toLowerCase();
    let subject = "mathematics";
    let subjectExplicit = false;
    if (text.includes("program")) {
        subject = "programming";
        subjectExplicit = true;
    } else if (text.includes("analytic") || text.includes("data")) {
        subject = "analytics";
        subjectExplicit = true;
    } else if (text.includes("ai") || text.includes("machine learning")) {
        subject = "ai";
        subjectExplicit = true;
    } else if (text.includes("math") || text.includes("algebra")) {
        subject = "mathematics";
        subjectExplicit = true;
    }

    let style = "mixed";
    if (text.includes("visual")) {
        style = "visual";
    } else if (text.includes("read")) {
        style = "reading";
    } else if (text.includes("hands")) {
        style = "handson";
    }

    let performance = "medium";
    if (text.includes("low") || text.includes("weak")) {
        performance = "low";
    } else if (text.includes("high") || text.includes("strong")) {
        performance = "high";
    }

    let quizScore = 65;
    const scoreMatch = text.match(/\b(\d{1,3})\b/);
    if (scoreMatch) {
        quizScore = Math.max(0, Math.min(100, Number(scoreMatch[1])));
    }

    const certification = text.includes("exam") || text.includes("certification");
    const intent = detectIntent({ query: text, certification, performance, quizScore });

    return { subject, subjectExplicit, style, performance, quizScore, intent };
}

function getSubjectCourseNames(subject) {
    if (subject === "programming") {
        return ["Programming Fundamentals", "Data Structures with Practice"];
    }
    if (subject === "analytics") {
        return ["Statistics Basics", "Data Visualization Studio"];
    }
    if (subject === "ai") {
        return ["AI Foundations", "Machine Learning Concepts"];
    }
    return ["Foundations of Algebra", "Applied Problem Solving Lab"];
}

function getTargetDifficulty(performance, quizScore) {
    if (performance === "low" || quizScore < 60) {
        return "beginner";
    }
    if (performance === "high" || quizScore > 80) {
        return "advanced";
    }
    return "intermediate";
}

function getCourseMeta(courseName) {
    if (getSubjectCourseNames("mathematics").includes(courseName)) {
        return { subject: "mathematics", difficulty: "beginner" };
    }
    if (getSubjectCourseNames("programming").includes(courseName)) {
        return {
            subject: "programming",
            difficulty: courseName.includes("Data Structures") ? "intermediate" : "beginner"
        };
    }
    if (getSubjectCourseNames("analytics").includes(courseName)) {
        return { subject: "analytics", difficulty: "intermediate" };
    }
    if (getSubjectCourseNames("ai").includes(courseName)) {
        return {
            subject: "ai",
            difficulty: courseName.includes("Machine Learning") ? "advanced" : "intermediate"
        };
    }
    if (courseName.includes("Certification")) {
        return { subject: "general", difficulty: "advanced" };
    }
    if (courseName.includes("Diagnostic") || courseName.includes("Mentor")) {
        return { subject: "general", difficulty: "beginner" };
    }
    return { subject: "general", difficulty: "intermediate" };
}

function recommendWithML({ grade, subject, intent, performance, quizScore, userVector, feedback }) {
    const gradeBoost = { school: 1, undergraduate: 0.75, postgraduate: 0.5 };
    const targetDifficulty = getTargetDifficulty(performance, quizScore);

    return courseCatalog
        .map((course) => {
            let score = cosineSimilarity(userVector, course.vector);
            const meta = getCourseMeta(course.name);

            if (course.level === grade) {
                score += gradeBoost[grade] * 0.2;
            } else if (course.level === "postgraduate") {
                score -= 0.18;
            }
            if (meta.subject === subject) {
                score += 0.35;
            } else if (meta.subject !== "general") {
                score -= 0.2;
            }
            if (meta.difficulty === targetDifficulty) {
                score += 0.16;
            } else if (targetDifficulty === "beginner" && meta.difficulty === "advanced") {
                score -= 0.14;
            }
            if (intent === "Certification preparation" && course.name.includes("Certification")) {
                score += 0.25;
            }
            if (intent === "Skill assessment" && course.name.includes("Diagnostic")) {
                score += 0.2;
            }

            // Feedback-aware tuning to improve relevance.
            if (feedback?.concern === "difficulty") {
                if (course.name.includes("Beginner") || course.name.includes("Foundations") || course.name.includes("Diagnostic")) {
                    score += 0.25;
                }
                if (course.name.includes("Machine Learning") || course.name.includes("Projects")) {
                    score -= 0.15;
                }
            } else if (feedback?.concern === "relevance") {
                const targetSubject = latestAssessment?.subject || "";
                if (targetSubject && course.name.toLowerCase().includes(targetSubject.slice(0, 4))) {
                    score += 0.2;
                }
            } else if (feedback?.concern === "clarity") {
                if (course.name.includes("Concept") || course.name.includes("Foundations") || course.name.includes("Videos")) {
                    score += 0.22;
                }
            } else if (feedback?.concern === "pace") {
                if (course.name.includes("Mentor") || course.name.includes("Beginner") || course.name.includes("Diagnostic")) {
                    score += 0.24;
                }
                if (course.name.includes("Projects")) {
                    score -= 0.12;
                }
            }

            const freeText = (feedback?.text || "").toLowerCase();
            if (freeText.includes("math") && course.name.toLowerCase().includes("algebra")) {
                score += 0.12;
            }
            if (freeText.includes("program") && course.name.toLowerCase().includes("program")) {
                score += 0.12;
            }

            return {
                name: course.name,
                score: Math.max(0, Math.min(score, 1.9))
            };
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

function detectWeakTopics(subject, query, performance, quizScore) {
    const topicMap = {
        mathematics: ["algebra", "geometry", "trigonometry", "calculus", "statistics"],
        programming: ["loops", "arrays", "functions", "recursion", "data structures"],
        analytics: ["statistics", "charts", "visualization", "probability", "data interpretation"],
        ai: ["machine learning", "model training", "ethics", "neural networks", "data preprocessing"]
    };

    const lowerQuery = (query || "").toLowerCase();
    const subjectTopics = topicMap[subject] || [];
    const mentioned = subjectTopics.filter((topic) => lowerQuery.includes(topic));

    if (mentioned.length) {
        return mentioned.slice(0, 2);
    }
    if (performance === "low" || quizScore < 60) {
        return subjectTopics.slice(0, 2);
    }
    return subjectTopics.slice(1, 3);
}

function renderImprovementSuggestions({ subject, performance, quizScore, intent, recommendations, query }) {
    const tips = [];
    const focusCourse = recommendations?.[0]?.name;
    const weakTopics = detectWeakTopics(subject, query, performance, quizScore);

    if (performance === "low" || quizScore < 60) {
        tips.push(`Start with 30 minutes daily on ${subject} fundamentals and revise mistakes immediately after each practice set.`);
        tips.push("Take two short quizzes per week and track weak topics to avoid repeating the same errors.");
    } else if (performance === "high" || quizScore > 80) {
        tips.push(`Increase challenge level in ${subject} using timed problem sets and advanced concept questions.`);
        tips.push("Teach one concept weekly to a peer; this improves depth and retention.");
    } else {
        tips.push(`Maintain consistent ${subject} practice: 45 minutes study + 15 minutes recap each day.`);
        tips.push("Use weekly checkpoints to measure progress and adjust focus areas.");
    }

    if (intent === "Certification preparation") {
        tips.push("Follow a mock-test cycle: attempt, review wrong answers, then repeat with a stricter time limit.");
    } else if (intent === "Skill assessment") {
        tips.push("Prioritize gap-remediation modules and re-attempt the same topic after 48 hours for reinforcement.");
    }

    if (focusCourse) {
        tips.push(`Complete the top recommendation first: ${focusCourse}, then move to the next ranked course.`);
    }
    if (weakTopics.length) {
        tips.push(`Prioritize weak topics this week: ${weakTopics.join(", ")}.`);
        tips.push(`For each weak topic, practice 10 questions and note at least one mistake pattern.`);
    }

    tips.push("Track weekly improvement by comparing quiz score trends, not one-time scores.");

    improvementSuggestionsList.innerHTML = "";
    tips.slice(0, 5).forEach((tip) => {
        const li = document.createElement("li");
        li.textContent = tip;
        improvementSuggestionsList.appendChild(li);
    });
}

function renderResourceCatalog() {
    if (!resourceCatalog || !resourceFilter) {
        return;
    }

    const filterValue = resourceFilter.value;
    const visibleResources = filterValue === "all"
        ? resourceLibrary
        : resourceLibrary.filter((item) => item.subject === filterValue);

    resourceCatalog.innerHTML = "";

    if (!visibleResources.length) {
        resourceCatalog.innerHTML = '<p class="hint">No resources found for this subject.</p>';
        return;
    }

    visibleResources.forEach((item) => {
        const card = document.createElement("article");
        card.className = "resource-card";
        card.innerHTML = `
            <h4>${item.title}</h4>
            <p class="resource-meta">${item.type} | ${item.difficulty}</p>
            <p class="resource-desc">${item.description}</p>
            <p class="resource-meta"><a href="${item.youtube}" target="_blank" rel="noopener noreferrer">Watch Practice Video</a></p>
            <button type="button" data-resource-id="${item.id}">${enrolledResourceIds.has(item.id) ? "Enrolled" : "Enroll Resource"}</button>
        `;

        const actionButton = card.querySelector("button");
        actionButton.disabled = enrolledResourceIds.has(item.id);
        actionButton.addEventListener("click", () => {
            enrollResourceById(item.id, true);
        });

        resourceCatalog.appendChild(card);
    });
}

function renderEnrolledList() {
    if (!enrolledList) {
        return;
    }

    const enrolledItems = resourceLibrary.filter((item) => enrolledResourceIds.has(item.id));
    enrolledList.innerHTML = "";

    if (!enrolledItems.length) {
        enrolledList.innerHTML = "<li>No enrolled resources yet.</li>";
        return;
    }

    enrolledItems.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${item.title} (${item.subject})`;
        enrolledList.appendChild(li);
    });
}

function enrollResourceById(resourceId, showStatus) {
    const resource = resourceLibrary.find((item) => item.id === resourceId);
    if (!resource || enrolledResourceIds.has(resourceId)) {
        return;
    }

    enrolledResourceIds.add(resourceId);
    renderResourceCatalog();
    renderEnrolledList();

    if (showStatus) {
        engagementStatus.textContent = `Enrolled in "${resource.title}". Added to your study plan.`;
    }
}

assessmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const grade = "school";
    const subject = document.getElementById("subjectInterest").value;
    const style = document.getElementById("learningStyle").value;
    const performance = document.getElementById("performance").value;
    const quizScore = Number(document.getElementById("quizScore").value);
    const query = document.getElementById("textQuery").value.trim();
    const certification = document.getElementById("goalCertification").checked;

    if (!consentCheck.checked) {
        complianceMsg.textContent = "Consent missing: enable consent to generate final recommendations.";
        return;
    }

    complianceMsg.textContent = "Consent confirmed. Compliance checks passed for recommendation output.";

    const intent = detectIntent({ query, certification, performance, quizScore });
    const userVector = buildUserVector({ subject, style, intent, performance, quizScore });
    const recommendations = recommendWithML({
        grade,
        subject,
        intent,
        performance,
        quizScore,
        userVector,
        feedback: feedbackSignals
    });
    latestAssessment = { grade, subject, style, performance, quizScore, query, intent, recommendations };

    intentResult.textContent = `Detected intent: ${intent}`;
    assessmentSummary.textContent = `Assessment summary: ${grade} learner, subject ${subject}, ${style} style, ${performance} performance, quiz ${quizScore}%.`;
    updatePerformanceDashboard(subject, performance, quizScore);
    renderRecommendationResults(recommendations);
    renderImprovementSuggestions({ subject, performance, quizScore, intent, recommendations, query });
});

submitFeedbackBtn.addEventListener("click", () => {
    const concern = document.querySelector('input[name="concern"]:checked')?.value;
    const extra = document.getElementById("feedbackText").value.trim();
    feedbackSignals.concern = concern || "none";
    feedbackSignals.text = extra;

    const responses = {
        difficulty: "We will reduce complexity, unlock pre-requisite modules, and add easier practice sets.",
        relevance: "We will refine your subject tags and prioritize role-specific content.",
        clarity: "We will switch to clearer explanations with worked examples.",
        pace: "We will slow your weekly pace and reduce daily workload."
    };

    const baseResponse = responses[concern] || "Your concern is recorded.";
    feedbackResponse.textContent = extra ? `${baseResponse} Note received: \"${extra}\".` : baseResponse;

    if (latestAssessment) {
        const userVector = buildUserVector({
            subject: latestAssessment.subject,
            style: latestAssessment.style,
            intent: latestAssessment.intent,
            performance: latestAssessment.performance,
            quizScore: latestAssessment.quizScore
        });
        const tunedRecommendations = recommendWithML({
            grade: latestAssessment.grade,
            subject: latestAssessment.subject,
            intent: latestAssessment.intent,
            performance: latestAssessment.performance,
            quizScore: latestAssessment.quizScore,
            userVector,
            feedback: feedbackSignals
        });
        latestAssessment.recommendations = tunedRecommendations;
        renderRecommendationResults(tunedRecommendations);
        renderImprovementSuggestions({
            subject: latestAssessment.subject,
            performance: latestAssessment.performance,
            quizScore: latestAssessment.quizScore,
            intent: latestAssessment.intent,
            recommendations: tunedRecommendations,
            query: latestAssessment.query
        });
        engagementStatus.textContent = "Recommendations were re-ranked using your feedback for better accuracy.";
    }
});

openResourcesBtn.addEventListener("click", () => {
    const recommendedSubject = latestAssessment?.subject || "all";
    resourceFilter.value = recommendedSubject;
    renderResourceCatalog();

    engagementStatus.textContent = recommendedSubject === "all"
        ? "Showing all available resources."
        : `Resources filtered for ${recommendedSubject}.`;
});

enrollCourseBtn.addEventListener("click", () => {
    if (!latestAssessment || !latestAssessment.recommendations?.length) {
        const firstVisible = resourceLibrary.find((item) => !enrolledResourceIds.has(item.id));
        if (firstVisible) {
            enrollResourceById(firstVisible.id, true);
        } else {
            engagementStatus.textContent = "All listed resources are already enrolled.";
        }
        return;
    }

    const recommendedMatch = resourceLibrary.find((item) => {
        if (enrolledResourceIds.has(item.id)) {
            return false;
        }
        return item.subject === latestAssessment.subject;
    });

    if (recommendedMatch) {
        enrollResourceById(recommendedMatch.id, true);
        return;
    }

    const fallback = resourceLibrary.find((item) => !enrolledResourceIds.has(item.id));
    if (fallback) {
        enrollResourceById(fallback.id, true);
    } else {
        engagementStatus.textContent = "All listed resources are already enrolled.";
    }
});

trackProgressBtn.addEventListener("click", () => {
    const enrolledCount = enrolledResourceIds.size;
    if (!enrolledCount) {
        engagementStatus.textContent = "Enroll in at least one resource to start progress tracking.";
        return;
    }

    const computedCompletion = Math.min(100, 50 + enrolledCount * 7);
    completionRate.textContent = `${computedCompletion}%`;
    engagementStatus.textContent = `Tracking ${enrolledCount} enrolled resources. Completion updated to ${computedCompletion}%.`;
});

if (resourceFilter) {
    resourceFilter.addEventListener("change", () => {
        renderResourceCatalog();
    });
}

renderResourceCatalog();
renderEnrolledList();

function addChatMessage(role, text) {
    const row = document.createElement("div");
    row.className = `chat-row ${role}`;
    const bubble = document.createElement("p");
    bubble.textContent = text;
    row.appendChild(bubble);
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function buildChatResponse(userText) {
    const lower = userText.toLowerCase();

    if (lower.includes("hello") || lower.includes("hi")) {
        return "Hi! I can recommend school-level courses based on your subject, learning style, and score.";
    }

    if (lower.includes("what can you do")) {
        return "I provide school-only recommendations, quick study plans, and next-step actions.";
    }

    const profile = parseChatToSchoolProfile(userText);
    const userVector = buildUserVector(profile);
    const ranked = recommendWithML({
        grade: "school",
        subject: profile.subject,
        intent: profile.intent,
        performance: profile.performance,
        quizScore: profile.quizScore,
        userVector
    });
    const subjectOnly = profile.subjectExplicit
        ? ranked.filter((item) => getSubjectCourseNames(profile.subject).includes(item.name))
        : ranked;

    if (!subjectOnly.length) {
        return "I could not rank courses right now. Try asking with subject and score.";
    }

    const topTwo = subjectOnly.slice(0, 2).map((item) => item.name).join(" and ");
    const match = Math.min(100, Math.round((subjectOnly[0].score / 1.5) * 100));
    return `For school students, I recommend ${topTwo}. Top match is ${match}%. Intent detected: ${profile.intent}.`;
}

async function fetchRemoteChatbotReply(userText) {
    const payload = {
        message: userText,
        scope: "school_students_only",
        latestAssessment
    };

    const apiBase = await getApiBase();
    const remoteChatEndpoint = `${apiBase}/api/recommend-chat`;
    const response = await fetch(remoteChatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        const message = errorPayload?.message || errorPayload?.error || "Remote AI request failed";
        throw new Error(`${message} (${response.status})`);
    }

    const data = await response.json();
    if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Remote AI response is invalid.");
    }
    return data.reply.trim();
}

async function handleChatSend() {
    const userText = chatInput.value.trim();
    if (!userText) {
        return;
    }

    addChatMessage("user", userText);
    chatInput.value = "";

    if (lowerCaseSafe(userText).includes("last recommendation") && latestAssessment) {
        const latestTop = latestAssessment.recommendations.slice(0, 2).map((item) => item.name).join(" and ");
        addChatMessage("bot", `Your last school recommendation was: ${latestTop}.`);
        return;
    }

    if (liveAiToggle.checked) {
        chatApiStatus.textContent = "Mode: DeepSeek API (request in progress).";
        chatSend.disabled = true;
        try {
            const remoteReply = await fetchRemoteChatbotReply(userText);
            addChatMessage("bot", remoteReply);
            chatApiStatus.textContent = "Mode: DeepSeek API (connected).";
        } catch (error) {
            const fallbackReply = buildChatResponse(userText);
            addChatMessage("bot", `${fallbackReply} [Fallback: ${error.message}]`);
            chatApiStatus.textContent = "Mode: DeepSeek API failed, switched to local ML fallback.";
        } finally {
            chatSend.disabled = false;
        }
        return;
    }

    const response = buildChatResponse(userText);
    addChatMessage("bot", response);
    chatApiStatus.textContent = "Mode: Local ML chatbot.";
}

function lowerCaseSafe(value) {
    return (value || "").toLowerCase();
}

function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-theme", isDark);
    if (themeToggleBtn) {
        themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
    }
}

chatSend.addEventListener("click", handleChatSend);
chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        handleChatSend();
    }
});

liveAiToggle.addEventListener("change", () => {
    chatApiStatus.textContent = liveAiToggle.checked
        ? "Mode: DeepSeek API enabled."
        : "Mode: Local ML chatbot.";
});

chatApiStatus.textContent = liveAiToggle.checked
    ? "Mode: DeepSeek API enabled."
    : "Mode: Local ML chatbot.";

if (themeToggleBtn) {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
    });
}

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("eduaiCurrentUser");
    window.location.href = "Frontend.html";
});


