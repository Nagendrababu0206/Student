const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");
const studyChart = document.getElementById("studyChart");

const assessmentForm = document.getElementById("assessmentForm");
const intentResult = document.getElementById("intentResult");
const recommendationList = document.getElementById("recommendationList");
const assessmentSummary = document.getElementById("assessmentSummary");
const consentCheck = document.getElementById("consentCheck");
const complianceMsg = document.getElementById("complianceMsg");
const submitFeedbackBtn = document.getElementById("submitFeedback");
const feedbackResponse = document.getElementById("feedbackResponse");
const engagementStatus = document.getElementById("engagementStatus");

const openResourcesBtn = document.getElementById("openResources");
const enrollCourseBtn = document.getElementById("enrollCourse");
const trackProgressBtn = document.getElementById("trackProgress");

const studentEmail = localStorage.getItem("eduaiCurrentUser") || "student@eduai.com";
const studentName = studentEmail.split("@")[0];
welcomeUser.textContent = studentName;

const weeklyData = [1.8, 2.2, 1.4, 2.8, 2.1, 2.6, 1.6];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxHours = Math.max(...weeklyData);

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

function buildRecommendations({ subject, grade, style, intent, performance }) {
    const baseMap = {
        mathematics: ["Foundations of Algebra", "Applied Problem Solving Lab"],
        programming: ["Programming Fundamentals", "Data Structures with Practice"],
        analytics: ["Statistics Basics", "Data Visualization Studio"],
        ai: ["AI Foundations", "Machine Learning Concepts"]
    };

    const recommendations = [...(baseMap[subject] || ["General Study Skills Module"])];

    if (intent === "Certification preparation") {
        recommendations.push("Certification Mock Test Series");
        recommendations.push("Revision Tracker and Exam Planner");
    }

    if (intent === "Skill assessment") {
        recommendations.push("Diagnostic Quiz Pack and Gap Remediation");
    }

    if (style === "visual") {
        recommendations.push("Concept Videos and Visual Notes");
    } else if (style === "handson") {
        recommendations.push("Hands-on Assignments and Weekly Projects");
    }

    if (performance === "low") {
        recommendations.push("Beginner Pace Mentor Sessions");
    }

    recommendations.push(`Level path: ${grade} curriculum alignment`);
    return recommendations;
}

assessmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const grade = document.getElementById("gradeLevel").value;
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
    const recommendations = buildRecommendations({ subject, grade, style, intent, performance });

    intentResult.textContent = `Detected intent: ${intent}`;
    assessmentSummary.textContent = `Assessment summary: ${grade} learner, subject ${subject}, ${style} style, ${performance} performance, quiz ${quizScore}%.`;

    recommendationList.innerHTML = "";
    recommendations.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
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
