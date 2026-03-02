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
const strongSubject = document.getElementById("strongSubject");
const weakSubject = document.getElementById("weakSubject");
const personalizedSuggestions = document.getElementById("personalizedSuggestions");

const openResourcesBtn = document.getElementById("openResources");
const enrollCourseBtn = document.getElementById("enrollCourse");
const trackProgressBtn = document.getElementById("trackProgress");
const resourceFilter = document.getElementById("resourceFilter");
const resourceCatalog = document.getElementById("resourceCatalog");
const enrolledList = document.getElementById("enrolledList");
const studyResourceSelect = document.getElementById("studyResourceSelect");
const studyMinutesInput = document.getElementById("studyMinutesInput");
const logStudyTimeBtn = document.getElementById("logStudyTime");
const studyLogStatus = document.getElementById("studyLogStatus");
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

const weeklyData = [0, 0, 0, 0, 0, 0, 0];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let latestAssessment = null;
const enrolledResourceIds = new Set();
const resourceStudyMinutes = {};
const resourceEnrollmentMeta = {};
const dailyStudyMinutes = {};
const assessmentHistory = [];
const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const LOCAL_API_BASE = "http://localhost:3001";
let remoteApiBase = "";
const THEME_STORAGE_KEY = "eduaiTheme";
const ANALYZER_STORAGE_KEY = "eduaiAnalyzerState";
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

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function readNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function saveAnalyzerState() {
    const payload = {
        enrolledIds: Array.from(enrolledResourceIds),
        studyMinutes: resourceStudyMinutes,
        enrollmentMeta: resourceEnrollmentMeta,
        dailyMinutes: dailyStudyMinutes,
        assessments: assessmentHistory
    };
    localStorage.setItem(ANALYZER_STORAGE_KEY, JSON.stringify(payload));
}

function loadAnalyzerState() {
    let payload = null;
    try {
        payload = JSON.parse(localStorage.getItem(ANALYZER_STORAGE_KEY) || "{}");
    } catch {
        payload = {};
    }

    const validResourceIds = new Set(resourceLibrary.map((item) => item.id));
    const enrolledIds = Array.isArray(payload?.enrolledIds) ? payload.enrolledIds : [];
    enrolledIds.forEach((id) => {
        if (validResourceIds.has(id)) {
            enrolledResourceIds.add(id);
        }
    });

    Object.entries(payload?.studyMinutes || {}).forEach(([id, minutes]) => {
        if (validResourceIds.has(id)) {
            resourceStudyMinutes[id] = Math.max(0, readNumber(minutes));
        }
    });

    Object.entries(payload?.enrollmentMeta || {}).forEach(([id, meta]) => {
        if (!validResourceIds.has(id)) {
            return;
        }
        const enrolledAt = String(meta?.enrolledAt || "");
        if (enrolledAt) {
            resourceEnrollmentMeta[id] = { enrolledAt };
        }
    });

    Object.entries(payload?.dailyMinutes || {}).forEach(([day, minutes]) => {
        dailyStudyMinutes[day] = Math.max(0, readNumber(minutes));
    });

    const rawAssessments = Array.isArray(payload?.assessments) ? payload.assessments : [];
    rawAssessments.forEach((item) => {
        if (!item || typeof item.subject !== "string") {
            return;
        }
        assessmentHistory.push({
            subject: item.subject,
            quizScore: Math.max(0, Math.min(100, readNumber(item.quizScore))),
            performance: String(item.performance || "medium"),
            query: String(item.query || ""),
            timestamp: String(item.timestamp || "")
        });
    });

    enrolledResourceIds.forEach((id) => {
        if (resourceStudyMinutes[id] === undefined) {
            resourceStudyMinutes[id] = 0;
        }
        if (!resourceEnrollmentMeta[id]) {
            resourceEnrollmentMeta[id] = { enrolledAt: new Date().toISOString() };
        }
    });
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
    { name: "School Geometry Essentials", vector: [0.92, 0.1, 0.2, 0, 0.5, 0.4, 0.2, 0, 0.7, 0.1], level: "school" },
    { name: "Fractions and Ratio Mastery", vector: [0.9, 0.1, 0.2, 0, 0.3, 0.5, 0.2, 0, 0.7, 0.1], level: "school" },
    { name: "Programming Fundamentals", vector: [0.1, 0.95, 0.2, 0.1, 0.2, 0.3, 0.7, 0, 0.6, 0.2], level: "school" },
    { name: "Data Structures with Practice", vector: [0, 0.95, 0.3, 0.1, 0.2, 0.3, 0.8, 0, 0.4, 0.6], level: "undergraduate" },
    { name: "Scratch to Python Bridge", vector: [0.1, 0.9, 0.2, 0.1, 0.3, 0.3, 0.8, 0, 0.7, 0.2], level: "school" },
    { name: "Coding Logic Drills for School", vector: [0.1, 0.88, 0.2, 0.1, 0.2, 0.4, 0.7, 0, 0.7, 0.2], level: "school" },
    { name: "Statistics Basics", vector: [0.2, 0.2, 0.95, 0.1, 0.2, 0.7, 0.2, 0, 0.6, 0.1], level: "school" },
    { name: "Data Visualization Studio", vector: [0.1, 0.3, 0.9, 0.1, 0.8, 0.2, 0.4, 0, 0.2, 0.5], level: "undergraduate" },
    { name: "School Data Interpretation Basics", vector: [0.2, 0.2, 0.9, 0.1, 0.6, 0.5, 0.3, 0, 0.7, 0.1], level: "school" },
    { name: "Probability for Beginners", vector: [0.2, 0.2, 0.88, 0.1, 0.3, 0.6, 0.2, 0, 0.7, 0.1], level: "school" },
    { name: "AI Foundations", vector: [0.1, 0.5, 0.3, 0.95, 0.2, 0.5, 0.4, 0.1, 0.3, 0.5], level: "undergraduate" },
    { name: "Machine Learning Concepts", vector: [0, 0.4, 0.7, 0.95, 0.2, 0.6, 0.5, 0.2, 0.2, 0.7], level: "postgraduate" },
    { name: "AI Ethics for School Students", vector: [0.1, 0.4, 0.3, 0.85, 0.3, 0.5, 0.3, 0.1, 0.7, 0.2], level: "school" },
    { name: "Smart Systems Basics", vector: [0.1, 0.45, 0.3, 0.82, 0.2, 0.5, 0.4, 0.1, 0.6, 0.2], level: "school" },
    { name: "Certification Mock Test Series", vector: [0.2, 0.4, 0.5, 0.4, 0.1, 0.4, 0.6, 1, 0.2, 0.8], level: "undergraduate" },
    { name: "Diagnostic Quiz Pack and Gap Remediation", vector: [0.2, 0.2, 0.3, 0.1, 0.1, 0.5, 0.3, 0.2, 1, 0.1], level: "school" },
    { name: "Concept Videos and Visual Notes", vector: [0.2, 0.2, 0.3, 0.2, 1, 0.1, 0.2, 0, 0.4, 0.1], level: "school" },
    { name: "Hands-on Assignments and Weekly Projects", vector: [0.1, 0.4, 0.3, 0.2, 0.1, 0.2, 1, 0, 0.3, 0.5], level: "undergraduate" },
    { name: "Beginner Pace Mentor Sessions", vector: [0.2, 0.2, 0.2, 0.2, 0.2, 0.5, 0.3, 0, 1, 0], level: "school" },
    { name: "Revision Tracker and Exam Planner", vector: [0.1, 0.3, 0.4, 0.3, 0.1, 0.4, 0.5, 0.9, 0.2, 0.7], level: "undergraduate" },
    { name: "School Study Skills Bootcamp", vector: [0.2, 0.2, 0.3, 0.2, 0.2, 0.5, 0.4, 0.3, 0.8, 0.2], level: "school" },
    { name: "Exam Revision Sprint", vector: [0.2, 0.3, 0.4, 0.2, 0.2, 0.4, 0.4, 0.8, 0.6, 0.3], level: "school" }
];

const resourceLibrary = [
    { id: "r1", subject: "mathematics", title: "Algebra Foundations", type: "Video Module", difficulty: "Beginner", description: "Core algebra concepts with worked school-level examples.", youtube: "https://www.youtube.com/watch?v=AUqeb9Z3y3k" },
    { id: "r2", subject: "mathematics", title: "Geometry Practice Pack", type: "Worksheet", difficulty: "Beginner", description: "Shape, angle, and theorem-based practice questions.", youtube: "https://www.youtube.com/watch?v=302eJ3TzJQU" },
    { id: "r9", subject: "mathematics", title: "Fractions and Ratios Workshop", type: "Video + Worksheet", difficulty: "Beginner", description: "Build confidence in fractions, ratios, and percent problems.", youtube: "https://www.youtube.com/watch?v=6M3uA9Iu4eQ" },
    { id: "r10", subject: "mathematics", title: "Mensuration Basics", type: "Concept Module", difficulty: "Beginner", description: "Area, perimeter, and volume using school-level examples.", youtube: "https://www.youtube.com/watch?v=8mAITcNt710" },
    { id: "r3", subject: "programming", title: "Python Basics for School", type: "Interactive Lab", difficulty: "Beginner", description: "Variables, loops, and functions through guided coding tasks.", youtube: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
    { id: "r4", subject: "programming", title: "Problem Solving with Pseudocode", type: "Reading + Quiz", difficulty: "Beginner", description: "Step-by-step logic building for coding interviews and exams.", youtube: "https://www.youtube.com/watch?v=azcrPFhaY9k" },
    { id: "r11", subject: "programming", title: "Scratch to Python Starter Path", type: "Video Series", difficulty: "Beginner", description: "Transition from block coding to beginner Python problems.", youtube: "https://www.youtube.com/watch?v=ERCMXc8x7mc" },
    { id: "r12", subject: "programming", title: "School Coding Logic Drills", type: "Practice Set", difficulty: "Beginner", description: "Small logic exercises for loops, conditionals, and tracing.", youtube: "https://www.youtube.com/watch?v=pkYVOmU3MgA" },
    { id: "r5", subject: "analytics", title: "Data Charts and Graph Reading", type: "Video + Quiz", difficulty: "Beginner", description: "Interpret school-level charts, tables, and trend questions.", youtube: "https://www.youtube.com/watch?v=9FtHB7V14Fo" },
    { id: "r6", subject: "analytics", title: "Statistics Essentials", type: "Worksheet", difficulty: "Intermediate", description: "Mean, median, mode, and basic probability drills.", youtube: "https://www.youtube.com/watch?v=xxpc-HPKN28" },
    { id: "r13", subject: "analytics", title: "Probability for School Learners", type: "Video + Practice", difficulty: "Beginner", description: "Simple probability and chance-based classroom questions.", youtube: "https://www.youtube.com/watch?v=SkidyDQuupA" },
    { id: "r14", subject: "analytics", title: "Data Interpretation Drill Pack", type: "Worksheet", difficulty: "Beginner", description: "Table and graph interpretation with school exam patterns.", youtube: "https://www.youtube.com/watch?v=YBq8hYQ4xC8" },
    { id: "r7", subject: "ai", title: "AI for School Students", type: "Concept Module", difficulty: "Beginner", description: "Simple introduction to AI use cases, ethics, and projects.", youtube: "https://www.youtube.com/watch?v=2ePf9rue1Ao" },
    { id: "r8", subject: "ai", title: "Machine Learning Basics", type: "Concept + Activity", difficulty: "Intermediate", description: "Basic model concepts with non-technical classroom examples.", youtube: "https://www.youtube.com/watch?v=ukzFI9rgwfU" },
    { id: "r15", subject: "ai", title: "AI Ethics Classroom Guide", type: "Reading + Case Study", difficulty: "Beginner", description: "Understand fairness, bias, and safe AI usage in schools.", youtube: "https://www.youtube.com/watch?v=ad79nYk2keg" },
    { id: "r16", subject: "ai", title: "Smart Systems Around Us", type: "Concept Video", difficulty: "Beginner", description: "Examples of AI in phones, maps, and education tools.", youtube: "https://www.youtube.com/watch?v=JMUxmLyrhSk" },
    {id: "r17", subject: "general", title: "Effective Study Techniques", type: "Video Module", difficulty: "Beginner", description: "Proven strategies for improving focus, retention, and exam performance.", youtube: "https://www.youtube.com/watch?v=IlU2ZDS2sQM" },
    {id: "r18", subject: "general", title: "Time Management for Students", type: "Video Module", difficulty: "Beginner", description: "Learn how to create study schedules, set priorities, and avoid procrastination.", youtube: "https://www.youtube.com/watch?v=V5-9bLmXlI8" },
    {id: "r19", subject: "general", title: "Mindfulness and Stress Reduction", type: "Video Module", difficulty: "Beginner", description: "Techniques for managing exam stress and maintaining mental well-being.", youtube: "https://www.youtube.com/watch?v=inpok4MKVLM" },
    {id: "r20", subject: "social", title: "Peer Study Groups", type: "Community Resource", difficulty: "All Levels", description: "Join or form study groups with classmates to enhance learning through collaboration.", youtube: "https://www.youtube.com/watch?v=H8eQYqz9V3o" },
    {id: "r21", subject: "english", title: "Academic Writing Skills", type: "Video Module", difficulty: "Beginner", description: "Improve your essay writing and comprehension skills for better performance in language subjects.", youtube: "https://www.youtube.com/watch?v=HAnw168huqA" },
    {id: "r22", subject: "english", title: "Reading Comprehension Strategies", type: "Video Module", difficulty: "Beginner", description: "Learn techniques to enhance understanding and analysis of reading passages.", youtube: "https://www.youtube.com/watch?v=5MgBikgcWnY" },
    {id: "r23", subject: "science", title: "Science Concepts Made Simple", type: "Video Module", difficulty: "Beginner", description: "Break down complex science topics into easy-to-understand concepts with real-world examples.", youtube: "https://www.youtube.com/watch?v=ZtL2cHqA8aM" }
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

function mapResourceSubjectToBucket(subject) {
    if (subject === "mathematics") {
        return "mathematics";
    }
    if (subject === "programming" || subject === "ai") {
        return "programming";
    }
    return "analytics";
}

function normalizeSubjectLabel(subject) {
    const normalized = String(subject || "").toLowerCase();
    if (normalized === "ai") {
        return "programming";
    }
    if (normalized === "science" || normalized === "english" || normalized === "social" || normalized === "general") {
        return "analytics";
    }
    if (normalized === "mathematics" || normalized === "programming" || normalized === "analytics") {
        return normalized;
    }
    return "analytics";
}

function getDisplaySubjectName(subject) {
    if (subject === "mathematics") {
        return "Mathematics";
    }
    if (subject === "programming") {
        return "Programming / AI";
    }
    return "Analytics / Other";
}

function getEnrollmentAgeDays(isoDate) {
    const enrolledTime = Date.parse(isoDate || "");
    if (!Number.isFinite(enrolledTime)) {
        return 0;
    }
    const diffMs = Date.now() - enrolledTime;
    return Math.max(0, diffMs / (1000 * 60 * 60 * 24));
}

function renderPersonalInsights() {
    if (!strongSubject || !weakSubject || !personalizedSuggestions) {
        return;
    }

    const stats = {
        mathematics: { searches: 0, quizTotal: 0, quizCount: 0, minutes: 0, enrollmentDays: 0 },
        programming: { searches: 0, quizTotal: 0, quizCount: 0, minutes: 0, enrollmentDays: 0 },
        analytics: { searches: 0, quizTotal: 0, quizCount: 0, minutes: 0, enrollmentDays: 0 }
    };

    assessmentHistory.forEach((item) => {
        const subject = normalizeSubjectLabel(item.subject);
        stats[subject].searches += 1;
        stats[subject].quizTotal += Math.max(0, Math.min(100, readNumber(item.quizScore)));
        stats[subject].quizCount += 1;
    });

    Object.entries(resourceStudyMinutes).forEach(([resourceId, minutes]) => {
        const resource = resourceLibrary.find((item) => item.id === resourceId);
        if (!resource) {
            return;
        }
        const subject = normalizeSubjectLabel(resource.subject);
        stats[subject].minutes += Math.max(0, readNumber(minutes));
    });

    enrolledResourceIds.forEach((resourceId) => {
        const resource = resourceLibrary.find((item) => item.id === resourceId);
        if (!resource) {
            return;
        }
        const subject = normalizeSubjectLabel(resource.subject);
        const enrolledAt = resourceEnrollmentMeta[resourceId]?.enrolledAt;
        stats[subject].enrollmentDays += getEnrollmentAgeDays(enrolledAt);
    });

    const subjects = Object.keys(stats);
    const scored = subjects.map((subject) => {
        const subjectData = stats[subject];
        const avgQuiz = subjectData.quizCount ? subjectData.quizTotal / subjectData.quizCount : 0;
        const studyScore = Math.min(100, (subjectData.minutes / 240) * 100);
        const enrollmentScore = Math.min(100, subjectData.enrollmentDays * 8);
        const searchScore = Math.min(100, subjectData.searches * 12);
        const overall = (avgQuiz * 0.45) + (studyScore * 0.30) + (enrollmentScore * 0.15) + (searchScore * 0.10);
        return { subject, avgQuiz, studyScore, enrollmentScore, searches: subjectData.searches, overall };
    });

    const hasAnyData = scored.some((item) => item.searches > 0 || item.studyScore > 0 || item.avgQuiz > 0);
    if (!hasAnyData) {
        strongSubject.textContent = "Strong subject: pending data.";
        weakSubject.textContent = "Weak subject: pending data.";
        personalizedSuggestions.innerHTML = "<li>Run assessments and log study time to generate strong/weak subject insights.</li>";
        return;
    }

    const sorted = scored.sort((a, b) => b.overall - a.overall);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    strongSubject.textContent = `Strong subject: ${getDisplaySubjectName(strongest.subject)} (score ${Math.round(strongest.overall)}).`;
    weakSubject.textContent = `Weak subject: ${getDisplaySubjectName(weakest.subject)} (score ${Math.round(weakest.overall)}).`;

    const tips = [];
    tips.push(`Keep momentum in ${getDisplaySubjectName(strongest.subject)} by adding one advanced session this week.`);
    tips.push(`Improve ${getDisplaySubjectName(weakest.subject)} with 30-40 minutes daily and one quiz review cycle.`);

    const weakResources = resourceLibrary
        .filter((item) => normalizeSubjectLabel(item.subject) === weakest.subject)
        .slice(0, 2)
        .map((item) => item.title);
    if (weakResources.length) {
        tips.push(`For weaker area, prioritize: ${weakResources.join(" and ")}.`);
    }

    const weakUpskillingCourses = getSubjectCourseNames(weakest.subject).slice(0, 3);
    if (weakUpskillingCourses.length) {
        tips.push(`Upskilling plan for ${getDisplaySubjectName(weakest.subject)}: ${weakUpskillingCourses.join(", ")}.`);
    }

    const weakSearches = stats[weakest.subject].searches;
    if (weakSearches > 0) {
        tips.push(`You searched ${getDisplaySubjectName(weakest.subject)} ${weakSearches} times; revisit those topics with short practice blocks.`);
    }

    if (stats[weakest.subject].enrollmentDays > 0 && stats[weakest.subject].minutes < 120) {
        tips.push(`You enrolled in ${getDisplaySubjectName(weakest.subject)} resources but logged low time. Add a 20-minute daily session for faster improvement.`);
    }

    personalizedSuggestions.innerHTML = "";
    tips.slice(0, 4).forEach((tip) => {
        const li = document.createElement("li");
        li.textContent = tip;
        personalizedSuggestions.appendChild(li);
    });
}

function getCurrentStreakDays() {
    let streak = 0;
    const current = new Date();
    for (let i = 0; i < 365; i += 1) {
        const key = formatDateKey(current);
        const minutes = readNumber(dailyStudyMinutes[key]);
        if (minutes <= 0) {
            break;
        }
        streak += 1;
        current.setDate(current.getDate() - 1);
    }
    return streak;
}

function getWeeklyHoursSeries() {
    const series = [];
    const today = new Date();
    for (let i = 6; i >= 0; i -= 1) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const key = formatDateKey(day);
        series.push(Number((readNumber(dailyStudyMinutes[key]) / 60).toFixed(1)));
    }
    return series;
}

function refreshAnalyzerDashboard() {
    const subjectMinutes = {
        mathematics: 0,
        programming: 0,
        analytics: 0
    };

    let totalMinutes = 0;
    Object.entries(resourceStudyMinutes).forEach(([resourceId, minutes]) => {
        const value = Math.max(0, readNumber(minutes));
        totalMinutes += value;

        const resource = resourceLibrary.find((item) => item.id === resourceId);
        if (!resource) {
            return;
        }
        const bucket = mapResourceSubjectToBucket(resource.subject);
        subjectMinutes[bucket] += value;
    });

    const completion = Math.min(100, Math.round((totalMinutes / 600) * 100));
    const mathScore = Math.min(100, Math.round((subjectMinutes.mathematics / 240) * 100));
    const programmingScore = Math.min(100, Math.round((subjectMinutes.programming / 240) * 100));
    const analyticsScore = Math.min(100, Math.round((subjectMinutes.analytics / 240) * 100));
    const weekSeries = getWeeklyHoursSeries();
    const weeklyTotal = weekSeries.reduce((sum, val) => sum + val, 0);
    const streak = getCurrentStreakDays();

    mathProgressBar.style.width = `${mathScore}%`;
    programmingProgressBar.style.width = `${programmingScore}%`;
    analyticsProgressBar.style.width = `${analyticsScore}%`;

    completionRate.textContent = `${completion}%`;
    goalPercentValue.textContent = `${completion}%`;
    goalDonut.style.background = `conic-gradient(#0284c7 0 ${completion}%, #e2e8f0 ${completion}% 100%)`;
    weeklyHours.textContent = `${weeklyTotal.toFixed(1)} hrs`;
    streakDays.textContent = `${streak} days`;

    if (totalMinutes <= 0) {
        trendMessage.textContent = "Enroll in a course and log study minutes to start analytics.";
    } else if (completion >= 75) {
        trendMessage.textContent = "Consistency is improving this week.";
    } else if (completion >= 45) {
        trendMessage.textContent = "You are progressing steadily. Keep logging daily study time.";
    } else {
        trendMessage.textContent = "Early progress detected. Keep daily study sessions consistent.";
    }

    renderWeeklyChart(weekSeries);
    renderPersonalInsights();
}

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
    let subject = latestAssessment?.subject || "mathematics";
    let subjectExplicit = false;
    if (text.includes("program") || text.includes("python") || text.includes("coding")) {
        subject = "programming";
        subjectExplicit = true;
    } else if (text.includes("analytic") || text.includes("data") || text.includes("statistics") || text.includes("probability")) {
        subject = "analytics";
        subjectExplicit = true;
    } else if (text.includes("ai") || text.includes("machine learning") || text.includes("ml")) {
        subject = "ai";
        subjectExplicit = true;
    } else if (text.includes("math") || text.includes("algebra") || text.includes("geometry") || text.includes("trigonometry")) {
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

function detectResourceOnlySubject(text) {
    if (text.includes("english") || text.includes("writing") || text.includes("comprehension")) {
        return "english";
    }
    if (text.includes("science") || text.includes("physics") || text.includes("chemistry") || text.includes("biology")) {
        return "science";
    }
    if (text.includes("social") || text.includes("group study") || text.includes("peer")) {
        return "social";
    }
    if (text.includes("study skills") || text.includes("time management") || text.includes("stress")) {
        return "general";
    }
    return "";
}

function buildResourceOnlyResponse(subject) {
    const options = resourceLibrary.filter((item) => item.subject === subject).slice(0, 2);
    if (!options.length) {
        return "I could not find matching resources right now. Try asking with subject and score.";
    }
    const names = options.map((item) => item.title).join(" and ");
    return `I recommend these ${subject} resources: ${names}. Enroll and log study time to improve analyzer results.`;
}

function applyQuerySignalsToRanked(ranked, queryText) {
    const text = (queryText || "").toLowerCase();
    const topicBoosts = {
        algebra: ["algebra", "foundations"],
        geometry: ["geometry"],
        probability: ["probability", "statistics"],
        statistics: ["statistics", "data"],
        python: ["python", "programming"],
        coding: ["coding", "programming"],
        ethics: ["ethics", "ai"],
        machine: ["machine learning"]
    };

    return ranked
        .map((item) => {
            let bonus = 0;
            const name = item.name.toLowerCase();

            Object.entries(topicBoosts).forEach(([keyword, tags]) => {
                if (text.includes(keyword) && tags.some((tag) => name.includes(tag))) {
                    bonus += 0.12;
                }
            });

            if ((text.includes("beginner") || text.includes("basic") || text.includes("easy")) &&
                (name.includes("foundations") || name.includes("basics") || name.includes("beginner") || name.includes("diagnostic"))) {
                bonus += 0.1;
            }

            if ((text.includes("advanced") || text.includes("hard")) &&
                (name.includes("machine learning") || name.includes("projects") || name.includes("certification") || name.includes("data structures"))) {
                bonus += 0.1;
            }

            return {
                ...item,
                score: Math.max(0, Math.min(item.score + bonus, 1.9))
            };
        })
        .sort((a, b) => b.score - a.score);
}

function applyPerformanceSignalsToRanked(ranked, profile, queryText) {
    const text = (queryText || "").toLowerCase();
    const wantsBeginner = profile.performance === "low"
        || profile.quizScore < 70
        || text.includes("beginner")
        || text.includes("basic")
        || text.includes("easy");
    const wantsAdvanced = profile.performance === "high"
        || profile.quizScore > 85
        || text.includes("advanced")
        || text.includes("hard");

    return ranked
        .map((item) => {
            const name = item.name.toLowerCase();
            let bonus = 0;

            if (wantsBeginner && (
                name.includes("foundations")
                || name.includes("basics")
                || name.includes("beginner")
                || name.includes("diagnostic")
            )) {
                bonus += 0.12;
            }

            if (wantsAdvanced && (
                name.includes("machine learning")
                || name.includes("projects")
                || name.includes("data structures")
                || name.includes("certification")
            )) {
                bonus += 0.12;
            }

            return {
                ...item,
                score: Math.max(0, Math.min(item.score + bonus, 1.9))
            };
        })
        .sort((a, b) => b.score - a.score);
}

function recordSearchHistoryFromChat(userText) {
    const text = lowerCaseSafe(userText);
    const looksLikeLearningQuery = (
        text.includes("recommend")
        || text.includes("study")
        || text.includes("subject")
        || text.includes("math")
        || text.includes("program")
        || text.includes("python")
        || text.includes("data")
        || text.includes("analytic")
        || text.includes("ai")
        || text.includes("science")
        || text.includes("english")
        || text.includes("score")
        || /\b\d{1,3}\b/.test(text)
    );

    if (!looksLikeLearningQuery) {
        return;
    }

    const profile = parseChatToSchoolProfile(userText);
    assessmentHistory.push({
        subject: profile.subject,
        quizScore: profile.quizScore,
        performance: profile.performance,
        query: userText,
        timestamp: new Date().toISOString()
    });
    if (assessmentHistory.length > 100) {
        assessmentHistory.splice(0, assessmentHistory.length - 100);
    }
    saveAnalyzerState();
    renderPersonalInsights();
}

function getSubjectCourseNames(subject) {
    if (subject === "programming") {
        return ["Programming Fundamentals", "Data Structures with Practice", "Scratch to Python Bridge", "Coding Logic Drills for School"];
    }
    if (subject === "analytics") {
        return ["Statistics Basics", "Data Visualization Studio", "School Data Interpretation Basics", "Probability for Beginners"];
    }
    if (subject === "ai") {
        return ["AI Foundations", "Machine Learning Concepts", "AI Ethics for School Students", "Smart Systems Basics"];
    }
    return ["Foundations of Algebra", "Applied Problem Solving Lab", "School Geometry Essentials", "Fractions and Ratio Mastery"];
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
        renderStudyResourceOptions();
        return;
    }

    enrolledItems.forEach((item, index) => {
        const li = document.createElement("li");
        const minutes = Math.max(0, readNumber(resourceStudyMinutes[item.id]));
        li.textContent = `${index + 1}. ${item.title} (${item.subject}) - ${minutes} min logged`;
        enrolledList.appendChild(li);
    });
    renderStudyResourceOptions();
}

function renderStudyResourceOptions() {
    if (!studyResourceSelect || !logStudyTimeBtn) {
        return;
    }

    const enrolledItems = resourceLibrary.filter((item) => enrolledResourceIds.has(item.id));
    studyResourceSelect.innerHTML = "";

    if (!enrolledItems.length) {
        studyResourceSelect.innerHTML = '<option value="">Select enrolled course</option>';
        studyResourceSelect.disabled = true;
        logStudyTimeBtn.disabled = true;
        return;
    }

    studyResourceSelect.disabled = false;
    logStudyTimeBtn.disabled = false;
    enrolledItems.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = index === 0
            ? `${item.title} (${item.subject})`
            : `${item.title} (${item.subject})`;
        studyResourceSelect.appendChild(option);
    });
}

function enrollResourceById(resourceId, showStatus) {
    const resource = resourceLibrary.find((item) => item.id === resourceId);
    if (!resource || enrolledResourceIds.has(resourceId)) {
        return;
    }

    enrolledResourceIds.add(resourceId);
    resourceStudyMinutes[resourceId] = 0;
    if (!resourceEnrollmentMeta[resourceId]) {
        resourceEnrollmentMeta[resourceId] = { enrolledAt: new Date().toISOString() };
    }
    saveAnalyzerState();
    renderResourceCatalog();
    renderEnrolledList();
    renderStudyResourceOptions();
    refreshAnalyzerDashboard();

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
    assessmentHistory.push({
        subject,
        quizScore,
        performance,
        query,
        timestamp: new Date().toISOString()
    });
    if (assessmentHistory.length > 100) {
        assessmentHistory.splice(0, assessmentHistory.length - 100);
    }
    saveAnalyzerState();

    intentResult.textContent = `Detected intent: ${intent}`;
    assessmentSummary.textContent = `Assessment summary: ${grade} learner, subject ${subject}, ${style} style, ${performance} performance, quiz ${quizScore}%.`;
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
    const hasSubjectOption = Array.from(resourceFilter.options).some((option) => option.value === recommendedSubject);
    resourceFilter.value = hasSubjectOption ? recommendedSubject : "all";
    renderResourceCatalog();

    engagementStatus.textContent = resourceFilter.value === "all"
        ? "Showing all available resources."
        : `Resources filtered for ${resourceFilter.value}.`;
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

    refreshAnalyzerDashboard();
    const totalMinutes = Object.values(resourceStudyMinutes).reduce((sum, value) => sum + Math.max(0, readNumber(value)), 0);
    engagementStatus.textContent = `Tracking ${enrolledCount} enrolled resources with ${(totalMinutes / 60).toFixed(1)} total study hours logged.`;
});

if (logStudyTimeBtn) {
    logStudyTimeBtn.addEventListener("click", () => {
        const resourceId = studyResourceSelect?.value || "";
        const minutes = Math.round(readNumber(studyMinutesInput?.value));

        if (!resourceId || !enrolledResourceIds.has(resourceId)) {
            if (studyLogStatus) {
                studyLogStatus.textContent = "Select an enrolled course before logging time.";
            }
            return;
        }
        if (minutes <= 0) {
            if (studyLogStatus) {
                studyLogStatus.textContent = "Enter valid study minutes (greater than 0).";
            }
            return;
        }

        resourceStudyMinutes[resourceId] = Math.max(0, readNumber(resourceStudyMinutes[resourceId])) + minutes;
        const todayKey = formatDateKey(new Date());
        dailyStudyMinutes[todayKey] = Math.max(0, readNumber(dailyStudyMinutes[todayKey])) + minutes;

        saveAnalyzerState();
        renderEnrolledList();
        refreshAnalyzerDashboard();

        const resource = resourceLibrary.find((item) => item.id === resourceId);
        if (studyMinutesInput) {
            studyMinutesInput.value = "";
        }
        if (studyLogStatus) {
            studyLogStatus.textContent = `Logged ${minutes} minutes for ${resource?.title || "selected course"}.`;
        }
        engagementStatus.textContent = "Study time logged. Analyzer updated from enrolled-course activity.";
    });
}

if (resourceFilter) {
    resourceFilter.addEventListener("change", () => {
        renderResourceCatalog();
    });
}

loadAnalyzerState();
renderResourceCatalog();
renderEnrolledList();
refreshAnalyzerDashboard();

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

    const resourceOnlySubject = detectResourceOnlySubject(lower);
    if (resourceOnlySubject) {
        return buildResourceOnlyResponse(resourceOnlySubject);
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
    const queryTuned = applyQuerySignalsToRanked(ranked, lower);
    const tunedRanked = applyPerformanceSignalsToRanked(queryTuned, profile, lower);
    const subjectOnly = profile.subjectExplicit
        ? tunedRanked.filter((item) => getSubjectCourseNames(profile.subject).includes(item.name))
        : tunedRanked;

    if (!subjectOnly.length) {
        return "I could not rank courses right now. Try asking with subject and score.";
    }

    const topThree = subjectOnly.slice(0, 3).map((item) => item.name).join(", ");
    const match = Math.min(100, Math.round((subjectOnly[0].score / 1.5) * 100));
    const plan = profile.quizScore < 70
        ? "Start with 30 minutes daily and focus on fundamentals first."
        : "Use 45 minutes daily with one timed practice session.";
    return `For school students, I recommend: ${topThree}. Top match is ${match}%. Intent: ${profile.intent}. ${plan}`;
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
    recordSearchHistoryFromChat(userText);
    chatInput.value = "";

    if (lowerCaseSafe(userText).includes("last recommendation") && latestAssessment) {
        const latestTop = latestAssessment.recommendations.slice(0, 2).map((item) => item.name).join(" and ");
        addChatMessage("bot", `Your last school recommendation was: ${latestTop}.`);
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

if (liveAiToggle) {
    liveAiToggle.checked = false;
    liveAiToggle.disabled = true;
}
chatApiStatus.textContent = "Mode: Local ML chatbot.";

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
