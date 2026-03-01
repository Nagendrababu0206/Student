const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");
const studyChart = document.getElementById("studyChart");

const assessmentForm = document.getElementById("assessmentForm");
const intentResult = document.getElementById("intentResult");
const recommendationList = document.getElementById("recommendationList");
const mlModelInfo = document.getElementById("mlModelInfo");
const assessmentSummary = document.getElementById("assessmentSummary");
const consentCheck = document.getElementById("consentCheck");
const complianceMsg = document.getElementById("complianceMsg");
const submitFeedbackBtn = document.getElementById("submitFeedback");
const feedbackResponse = document.getElementById("feedbackResponse");
const engagementStatus = document.getElementById("engagementStatus");

const openResourcesBtn = document.getElementById("openResources");
const enrollCourseBtn = document.getElementById("enrollCourse");
const trackProgressBtn = document.getElementById("trackProgress");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const liveAiToggle = document.getElementById("liveAiToggle");
const chatApiStatus = document.getElementById("chatApiStatus");

const studentEmail = localStorage.getItem("eduaiCurrentUser") || "student@eduai.com";
const studentName = studentEmail.split("@")[0];
welcomeUser.textContent = studentName;

const weeklyData = [1.8, 2.2, 1.4, 2.8, 2.1, 2.6, 1.6];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxHours = Math.max(...weeklyData);
let latestAssessment = null;
const API_BASE =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:3001"
        : "";
const REMOTE_CHAT_ENDPOINT = `${API_BASE}/api/recommend-chat`;

weeklyData.forEach((hours, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${(hours / maxHours) * 100}%`;
    bar.dataset.day = dayLabels[index];
    bar.title = `${dayLabels[index]}: ${hours} hrs`;
    studyChart.appendChild(bar);
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("eduaiCurrentUser");
    window.location.href = "Frontend.html";
});

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
    if (text.includes("program")) {
        subject = "programming";
    } else if (text.includes("analytic") || text.includes("data")) {
        subject = "analytics";
    } else if (text.includes("ai") || text.includes("machine learning")) {
        subject = "ai";
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

    return { subject, style, performance, quizScore, intent };
}

function recommendWithML({ grade, intent, userVector }) {
    const gradeBoost = { school: 1, undergraduate: 0.75, postgraduate: 0.5 };

    return courseCatalog
        .map((course) => {
            let score = cosineSimilarity(userVector, course.vector);

            if (course.level === grade) {
                score += gradeBoost[grade] * 0.2;
            }
            if (intent === "Certification preparation" && course.name.includes("Certification")) {
                score += 0.25;
            }
            if (intent === "Skill assessment" && course.name.includes("Diagnostic")) {
                score += 0.2;
            }

            return {
                name: course.name,
                score: Math.max(0, Math.min(score, 1.5))
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
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
    const recommendations = recommendWithML({ grade, intent, userVector });
    const confidence = Math.min(100, Math.round(((recommendations[0]?.score || 0) / 1.5) * 100));
    latestAssessment = { grade, subject, style, performance, quizScore, intent, recommendations };

    intentResult.textContent = `Detected intent: ${intent}`;
    assessmentSummary.textContent = `Assessment summary: ${grade} learner, subject ${subject}, ${style} style, ${performance} performance, quiz ${quizScore}%.`;
    mlModelInfo.textContent = `ML model: cosine similarity ranking over ${courseCatalog.length} courses. Top-match confidence: ${confidence}%.`;

    recommendationList.innerHTML = "";
    recommendations.forEach((item) => {
        const li = document.createElement("li");
        const normalizedScore = Math.min(100, Math.round((item.score / 1.5) * 100));
        li.textContent = `${item.name} (${normalizedScore}% match)`;
        recommendationList.appendChild(li);
    });
});

submitFeedbackBtn.addEventListener("click", () => {
    const concern = document.querySelector('input[name="concern"]:checked')?.value;
    const extra = document.getElementById("feedbackText").value.trim();

    const responses = {
        difficulty: "We will reduce complexity, unlock pre-requisite modules, and add easier practice sets.",
        relevance: "We will refine your subject tags and prioritize role-specific content.",
        clarity: "We will switch to clearer explanations with worked examples.",
        pace: "We will slow your weekly pace and reduce daily workload."
    };

    const baseResponse = responses[concern] || "Your concern is recorded.";
    feedbackResponse.textContent = extra ? `${baseResponse} Note received: \"${extra}\".` : baseResponse;
});

openResourcesBtn.addEventListener("click", () => {
    engagementStatus.textContent = "Resource access opened: personalized modules and reading resources are now prioritized.";
});

enrollCourseBtn.addEventListener("click", () => {
    engagementStatus.textContent = "Enrollment flow started: selected recommendations moved to your active learning plan.";
});

trackProgressBtn.addEventListener("click", () => {
    engagementStatus.textContent = "Progress tracking enabled: weekly goals and completion analytics are now active.";
});

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
    const ranked = recommendWithML({ grade: "school", intent: profile.intent, userVector });

    if (!ranked.length) {
        return "I could not rank courses right now. Try asking with subject and score.";
    }

    const topTwo = ranked.slice(0, 2).map((item) => item.name).join(" and ");
    const match = Math.min(100, Math.round((ranked[0].score / 1.5) * 100));
    return `For school students, I recommend ${topTwo}. Top match is ${match}%. Intent detected: ${profile.intent}.`;
}

async function fetchRemoteChatbotReply(userText) {
    const payload = {
        message: userText,
        scope: "school_students_only",
        latestAssessment
    };

    const response = await fetch(REMOTE_CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Remote AI request failed (${response.status}).`);
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
        chatApiStatus.textContent = "Mode: Live AI API (request in progress).";
        chatSend.disabled = true;
        try {
            const remoteReply = await fetchRemoteChatbotReply(userText);
            addChatMessage("bot", remoteReply);
            chatApiStatus.textContent = "Mode: Live AI API (connected).";
        } catch (error) {
            const fallbackReply = buildChatResponse(userText);
            addChatMessage("bot", `${fallbackReply} [Fallback: ${error.message}]`);
            chatApiStatus.textContent = "Mode: Live AI API failed, switched to local ML fallback.";
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

chatSend.addEventListener("click", handleChatSend);
chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        handleChatSend();
    }
});

liveAiToggle.addEventListener("change", () => {
    chatApiStatus.textContent = liveAiToggle.checked
        ? "Mode: Live AI API enabled."
        : "Mode: Local ML chatbot.";
});

