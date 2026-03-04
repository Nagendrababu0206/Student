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
const takeCourseQuizBtn = document.getElementById("takeCourseQuizBtn");
const takeCourseAssignmentBtn = document.getElementById("takeCourseAssignmentBtn");
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
const latestAssessmentMarks = document.getElementById("latestAssessmentMarks");
const subjectMarksSummary = document.getElementById("subjectMarksSummary");

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const liveAiToggle = document.getElementById("liveAiToggle");
const chatApiStatus = document.getElementById("chatApiStatus");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const focusDurationInput = document.getElementById("focusDuration");
const startFocusModeBtn = document.getElementById("startFocusMode");
const endFocusModeBtn = document.getElementById("endFocusMode");
const focusTimer = document.getElementById("focusTimer");
const focusStatus = document.getElementById("focusStatus");
const distractionCount = document.getElementById("distractionCount");

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
const FOCUS_STORAGE_KEY = "eduaiFocusState";
const CONSENT_STORAGE_KEY = "eduaiConsentAccepted";
const feedbackSignals = {
    concern: "none",
    text: ""
};
const focusSession = {
    active: false,
    endAt: 0,
    durationMinutes: 25,
    distractions: 0,
    awayStartedAt: 0
};
let focusIntervalId = null;
let analyzerSyncInFlight = false;

function syncConsentMessage(isChecked) {
    if (!complianceMsg) {
        return;
    }
    complianceMsg.textContent = isChecked
        ? "Consent confirmed. Compliance checks passed for recommendation output."
        : "Consent required before final recommendation release.";
}

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

function calculateAcademicScore(quizScore, assignmentMarks) {
    return Math.round((readNumber(quizScore) * 0.6) + (readNumber(assignmentMarks) * 0.4));
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

function formatRemainingTime(ms) {
    const safeMs = Math.max(0, ms);
    const totalSeconds = Math.floor(safeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function saveFocusState() {
    const payload = {
        active: focusSession.active,
        endAt: focusSession.endAt,
        durationMinutes: focusSession.durationMinutes,
        distractions: focusSession.distractions
    };
    localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(payload));
}

function loadFocusState() {
    let payload = null;
    try {
        payload = JSON.parse(localStorage.getItem(FOCUS_STORAGE_KEY) || "{}");
    } catch {
        payload = {};
    }

    focusSession.durationMinutes = Math.max(5, Math.min(180, Math.round(readNumber(payload?.durationMinutes || 25))));
    focusSession.distractions = Math.max(0, Math.round(readNumber(payload?.distractions || 0)));
    focusSession.endAt = Math.max(0, readNumber(payload?.endAt || 0));
    focusSession.active = Boolean(payload?.active) && focusSession.endAt > Date.now();
    focusSession.awayStartedAt = 0;
}

function syncFocusUI() {
    if (!focusTimer || !focusStatus || !distractionCount) {
        return;
    }

    const remainingMs = focusSession.active ? Math.max(0, focusSession.endAt - Date.now()) : 0;
    focusTimer.textContent = `Time left: ${formatRemainingTime(remainingMs)}`;
    distractionCount.textContent = `Distractions detected: ${focusSession.distractions}`;

    if (startFocusModeBtn) {
        startFocusModeBtn.disabled = focusSession.active;
    }
    if (endFocusModeBtn) {
        endFocusModeBtn.disabled = !focusSession.active;
    }
}

function stopFocusTicker() {
    if (focusIntervalId) {
        clearInterval(focusIntervalId);
        focusIntervalId = null;
    }
}

function endFocusSession(message) {
    const wasActive = focusSession.active;
    focusSession.active = false;
    focusSession.endAt = 0;
    focusSession.awayStartedAt = 0;
    stopFocusTicker();
    saveFocusState();
    syncFocusUI();

    if (message && focusStatus) {
        focusStatus.textContent = message;
    } else if (focusStatus && wasActive) {
        focusStatus.textContent = "Focus session ended.";
    }

    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
            // Ignore exit-fullscreen errors.
        });
    }
}

function startFocusTicker() {
    stopFocusTicker();
    focusIntervalId = setInterval(() => {
        if (!focusSession.active) {
            stopFocusTicker();
            return;
        }

        const remaining = focusSession.endAt - Date.now();
        if (remaining <= 0) {
            endFocusSession(`Session complete. Great work. Distractions during session: ${focusSession.distractions}.`);
            return;
        }
        syncFocusUI();
    }, 1000);
}

function startFocusSession() {
    const duration = Math.max(5, Math.min(180, Math.round(readNumber(focusDurationInput?.value || 25))));
    focusSession.durationMinutes = duration;
    focusSession.distractions = 0;
    focusSession.endAt = Date.now() + duration * 60 * 1000;
    focusSession.active = true;
    focusSession.awayStartedAt = 0;

    if (focusDurationInput) {
        focusDurationInput.value = String(duration);
    }
    if (focusStatus) {
        focusStatus.textContent = `Focus session started for ${duration} minutes. Stay in this app to avoid distraction marks.`;
    }

    saveFocusState();
    syncFocusUI();
    startFocusTicker();

    document.documentElement.requestFullscreen?.().catch(() => {
        if (focusStatus) {
            focusStatus.textContent = "Focus session running. Fullscreen not granted; keep this tab active.";
        }
    });
}

function registerFocusDistraction(reason) {
    if (!focusSession.active) {
        return;
    }
    if (focusSession.awayStartedAt) {
        return;
    }

    focusSession.distractions += 1;
    focusSession.awayStartedAt = Date.now();
    saveFocusState();
    syncFocusUI();
    if (focusStatus) {
        focusStatus.textContent = `Distraction detected (${reason}). Return to this app and continue your session.`;
    }
}

function registerFocusReturn() {
    if (!focusSession.active || !focusSession.awayStartedAt) {
        return;
    }
    const awaySeconds = Math.round((Date.now() - focusSession.awayStartedAt) / 1000);
    focusSession.awayStartedAt = 0;
    saveFocusState();
    if (focusStatus) {
        focusStatus.textContent = `Welcome back. You were away for ${awaySeconds}s. Continue focusing.`;
    }
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

function resetAnalyzerStateInMemory() {
    enrolledResourceIds.clear();
    assessmentHistory.length = 0;

    Object.keys(resourceStudyMinutes).forEach((key) => delete resourceStudyMinutes[key]);
    Object.keys(resourceEnrollmentMeta).forEach((key) => delete resourceEnrollmentMeta[key]);
    Object.keys(dailyStudyMinutes).forEach((key) => delete dailyStudyMinutes[key]);
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
            assignmentMarks: Math.max(0, Math.min(100, readNumber(item.assignmentMarks ?? item.quizScore))),
            points: Math.max(0, Math.min(100, readNumber(item.points ?? calculateAcademicScore(item.quizScore, item.assignmentMarks ?? item.quizScore)))),
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

function reloadAnalyzerStateAndRefresh(source) {
    if (analyzerSyncInFlight) {
        return;
    }
    analyzerSyncInFlight = true;
    try {
        resetAnalyzerStateInMemory();
        loadAnalyzerState();
        renderEnrolledList();
        refreshAnalyzerDashboard();
        syncAssessmentInputsFromHistory();
        refreshRecommendationsFromLatestMarks(source);
    } finally {
        analyzerSyncInFlight = false;
    }
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
const RECOMMENDATION_LIMIT = 5;
const recommendationCache = new Map();
const rankedCourseCatalog = courseCatalog.map((course) => {
    const lowerName = course.name.toLowerCase();
    return {
        ...course,
        lowerName,
        hasCertification: course.name.includes("Certification"),
        hasDiagnostic: course.name.includes("Diagnostic"),
        hasBeginner: course.name.includes("Beginner"),
        hasFoundations: course.name.includes("Foundations"),
        hasMentor: course.name.includes("Mentor"),
        hasProjects: course.name.includes("Projects"),
        hasMachineLearning: course.name.includes("Machine Learning"),
        hasConcept: course.name.includes("Concept"),
        hasVideos: course.name.includes("Videos")
    };
});
const courseNameLookupBySubject = {
    mathematics: new Set(getSubjectCourseNames("mathematics")),
    programming: new Set(getSubjectCourseNames("programming")),
    analytics: new Set(getSubjectCourseNames("analytics")),
    ai: new Set(getSubjectCourseNames("ai"))
};
const courseMetaByName = new Map(courseCatalog.map((course) => [course.name, getCourseMeta(course.name)]));

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
    {id: "r23", subject: "science", title: "Science Concepts Made Simple", type: "Video Module", difficulty: "Beginner", description: "Break down complex science topics into easy-to-understand concepts with real-world examples.", youtube: "https://www.youtube.com/watch?v=ZtL2cHqA8aM" },
    {id: "r24", subject: "certification", title: "School Python Certification Track", type: "Certification Frame", difficulty: "Intermediate", description: "Structured certification prep for Python basics with assignments and checkpoints.", youtube: "https://www.youtube.com/watch?v=rfscVS0vtbw", embed: "https://www.youtube.com/embed/rfscVS0vtbw" },
    {id: "r25", subject: "certification", title: "Data Analytics Certification Starter", type: "Certification Frame", difficulty: "Intermediate", description: "Certification-oriented analytics learning path focused on statistics and interpretation.", youtube: "https://www.youtube.com/watch?v=xxpc-HPKN28", embed: "https://www.youtube.com/embed/xxpc-HPKN28" },
    {id: "r26", subject: "certification", title: "AI Fundamentals Certification Prep", type: "Certification Frame", difficulty: "Intermediate", description: "Frame-based certification prep for AI foundations, ethics, and real examples.", youtube: "https://www.youtube.com/watch?v=2ePf9rue1Ao", embed: "https://www.youtube.com/embed/2ePf9rue1Ao" }
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
    if (normalized === "physics" || normalized === "chemistry") {
        return "analytics";
    }
    if (normalized === "science" || normalized === "english" || normalized === "social" || normalized === "general") {
        return "analytics";
    }
    if (normalized === "mathematics" || normalized === "programming" || normalized === "analytics") {
        return normalized;
    }
    return "analytics";
}

function getLatestScoresForSubject(subject) {
    const target = normalizeSubjectLabel(subject);
    for (let i = assessmentHistory.length - 1; i >= 0; i -= 1) {
        const item = assessmentHistory[i];
        if (normalizeSubjectLabel(item?.subject) !== target) {
            continue;
        }
        const quizScore = Math.max(0, Math.min(100, readNumber(item.quizScore)));
        const assignmentMarks = Math.max(0, Math.min(100, readNumber(item.assignmentMarks ?? item.quizScore)));
        const points = Math.max(0, Math.min(100, readNumber(item.points ?? calculateAcademicScore(quizScore, assignmentMarks))));
        return { quizScore, assignmentMarks, points, timestamp: String(item.timestamp || "") };
    }
    return null;
}

function getLatestAssessmentRecord() {
    if (!assessmentHistory.length) {
        return null;
    }
    return assessmentHistory[assessmentHistory.length - 1];
}

function refreshRecommendationsFromLatestMarks(source) {
    const subjectInput = document.getElementById("subjectInterest");
    const styleInput = document.getElementById("learningStyle");
    const performanceInput = document.getElementById("performance");
    const queryInput = document.getElementById("textQuery");
    const certificationInput = document.getElementById("goalCertification");
    const latestRecord = getLatestAssessmentRecord();

    if (!subjectInput || !styleInput) {
        return false;
    }

    if (!subjectInput.value && latestRecord?.subject) {
        subjectInput.value = String(latestRecord.subject).toLowerCase();
    }
    if (!styleInput.value) {
        styleInput.value = latestAssessment?.style || "mixed";
    }

    const subject = subjectInput.value;
    const style = styleInput.value;
    if (!subject || !style) {
        return false;
    }

    const latestScores = getLatestScoresForSubject(subject);
    if (!latestScores) {
        return false;
    }

    if (!consentCheck?.checked) {
        syncConsentMessage(false);
        return false;
    }

    const grade = "school";
    const quizScore = latestScores.quizScore;
    const assignmentMarks = latestScores.assignmentMarks;
    const performance = derivePerformanceFromScores(quizScore, assignmentMarks);
    const rawQuery = queryInput?.value?.trim() || "";
    const query = rawQuery || `Need help in ${subject} with quiz ${quizScore} and assignment ${assignmentMarks}`;
    const certification = Boolean(certificationInput?.checked);
    const intent = detectIntent({ query, certification, performance, quizScore, assignmentMarks });
    const userVector = buildUserVector({ subject, style, intent, performance, quizScore, assignmentMarks });
    const recommendations = recommendWithML({
        grade,
        subject,
        intent,
        performance,
        quizScore,
        assignmentMarks,
        userVector,
        feedback: feedbackSignals
    });

    if (!recommendations.length) {
        return false;
    }

    if (performanceInput) {
        performanceInput.value = performance;
    }

    latestAssessment = {
        grade,
        subject,
        style,
        performance,
        quizScore,
        assignmentMarks,
        query,
        intent,
        recommendations
    };

    intentResult.textContent = `Detected intent: ${intent}`;
    assessmentSummary.textContent = `Recommendations auto-updated from latest marks (${source}): quiz ${Math.round(quizScore)}%, assignment ${Math.round(assignmentMarks)}%, academic ${Math.round(calculateAcademicScore(quizScore, assignmentMarks))}%.`;
    renderRecommendationResults(recommendations);
    renderImprovementSuggestions({ subject, performance, quizScore, assignmentMarks, intent, recommendations, query });
    return true;
}

function syncAssessmentInputsFromHistory() {
    const subjectInput = document.getElementById("subjectInterest");
    const quizInput = document.getElementById("quizScore");
    const assignmentInput = document.getElementById("assignmentMarks");
    const performanceInput = document.getElementById("performance");
    if (!subjectInput || !quizInput || !assignmentInput) {
        return;
    }

    const snapshot = getLatestScoresForSubject(subjectInput.value);
    if (!snapshot) {
        quizInput.value = "";
        assignmentInput.value = "";
        if (assessmentSummary) {
            assessmentSummary.textContent = "No saved quiz/assignment marks for selected subject. Take quiz and assignment first.";
        }
        return;
    }

    quizInput.value = String(Math.round(snapshot.quizScore));
    assignmentInput.value = String(Math.round(snapshot.assignmentMarks));
    if (performanceInput) {
        performanceInput.value = derivePerformanceFromScores(snapshot.quizScore, snapshot.assignmentMarks);
    }
}

function redirectToQuizAndAssignmentWorkflow() {
    const subjectInput = document.getElementById("subjectInterest");
    const selectedSubject = String(subjectInput?.value || "").trim().toLowerCase();
    const enrolledItems = resourceLibrary.filter((item) => enrolledResourceIds.has(item.id));
    const enrolledSubjects = enrolledItems
        .map((item) => String(item.subject || "").toLowerCase())
        .filter(Boolean);

    const combinedSubjects = Array.from(new Set([selectedSubject, ...enrolledSubjects].filter(Boolean)));
    const encodedSubjects = encodeURIComponent(combinedSubjects.join(","));
    window.location.href = `Assessment.html?from=enrolled&subjects=${encodedSubjects}&next=assignment`;
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

function normalizeSubjectForDashboard(subject) {
    const normalized = String(subject || "").toLowerCase();
    if (normalized === "physics" || normalized === "chemistry") {
        return "science";
    }
    return normalized || "general";
}

function renderAssessmentMarksOverview() {
    if (!latestAssessmentMarks || !subjectMarksSummary) {
        return;
    }

    if (!assessmentHistory.length) {
        latestAssessmentMarks.textContent = "Latest marks: pending assessment.";
        subjectMarksSummary.innerHTML = "<li>No assessment scores available yet.</li>";
        return;
    }

    const latest = assessmentHistory[assessmentHistory.length - 1];
    const latestQuiz = Math.max(0, Math.min(100, readNumber(latest.quizScore)));
    const latestAssignment = Math.max(0, Math.min(100, readNumber(latest.assignmentMarks ?? latest.quizScore)));
    const latestAcademic = calculateAcademicScore(latestQuiz, latestAssignment);
    const latestSubject = normalizeSubjectForDashboard(latest.subject);
    latestAssessmentMarks.textContent = `Latest marks: ${latestSubject} | Quiz ${Math.round(latestQuiz)}% | Assignment ${Math.round(latestAssignment)}% | Academic ${Math.round(latestAcademic)}%.`;

    const bySubject = {};
    assessmentHistory.forEach((item) => {
        const subjectKey = normalizeSubjectForDashboard(item.subject);
        if (!bySubject[subjectKey]) {
            bySubject[subjectKey] = { quizTotal: 0, assignmentTotal: 0, count: 0 };
        }
        const quiz = Math.max(0, Math.min(100, readNumber(item.quizScore)));
        const assignment = Math.max(0, Math.min(100, readNumber(item.assignmentMarks ?? item.quizScore)));
        bySubject[subjectKey].quizTotal += quiz;
        bySubject[subjectKey].assignmentTotal += assignment;
        bySubject[subjectKey].count += 1;
    });

    const rows = Object.entries(bySubject)
        .map(([subject, stats]) => {
            const avgQuiz = stats.quizTotal / stats.count;
            const avgAssignment = stats.assignmentTotal / stats.count;
            const avgAcademic = calculateAcademicScore(avgQuiz, avgAssignment);
            return { subject, avgQuiz, avgAssignment, avgAcademic, count: stats.count };
        })
        .sort((a, b) => b.avgAcademic - a.avgAcademic);

    subjectMarksSummary.innerHTML = "";
    rows.forEach((row) => {
        const li = document.createElement("li");
        li.textContent = `${row.subject}: Quiz ${Math.round(row.avgQuiz)}%, Assignment ${Math.round(row.avgAssignment)}%, Academic ${Math.round(row.avgAcademic)}% (${row.count} attempts)`;
        subjectMarksSummary.appendChild(li);
    });
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
        mathematics: { searches: 0, quizTotal: 0, quizCount: 0, assignmentTotal: 0, assignmentCount: 0, pointsTotal: 0, pointsCount: 0, performanceTotal: 0, performanceCount: 0, minutes: 0, enrollmentDays: 0 },
        programming: { searches: 0, quizTotal: 0, quizCount: 0, assignmentTotal: 0, assignmentCount: 0, pointsTotal: 0, pointsCount: 0, performanceTotal: 0, performanceCount: 0, minutes: 0, enrollmentDays: 0 },
        analytics: { searches: 0, quizTotal: 0, quizCount: 0, assignmentTotal: 0, assignmentCount: 0, pointsTotal: 0, pointsCount: 0, performanceTotal: 0, performanceCount: 0, minutes: 0, enrollmentDays: 0 }
    };

    assessmentHistory.forEach((item) => {
        const subject = normalizeSubjectLabel(item.subject);
        const quizScore = Math.max(0, Math.min(100, readNumber(item.quizScore)));
        const assignmentMarks = Math.max(0, Math.min(100, readNumber(item.assignmentMarks ?? item.quizScore)));
        const assessmentPoints = Math.max(0, Math.min(100, readNumber(item.points ?? calculateAcademicScore(quizScore, assignmentMarks))));
        stats[subject].searches += 1;
        stats[subject].quizTotal += quizScore;
        stats[subject].quizCount += 1;
        stats[subject].assignmentTotal += assignmentMarks;
        stats[subject].assignmentCount += 1;
        stats[subject].pointsTotal += assessmentPoints;
        stats[subject].pointsCount += 1;
        const performanceLabel = String(item.performance || "medium").toLowerCase();
        const performanceScore = performanceLabel === "high" ? 92 : performanceLabel === "low" ? 45 : 70;
        stats[subject].performanceTotal += performanceScore;
        stats[subject].performanceCount += 1;
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
        const avgAssignment = subjectData.assignmentCount ? subjectData.assignmentTotal / subjectData.assignmentCount : 0;
        const avgPoints = subjectData.pointsCount ? subjectData.pointsTotal / subjectData.pointsCount : calculateAcademicScore(avgQuiz, avgAssignment);
        const avgPerformance = subjectData.performanceCount ? subjectData.performanceTotal / subjectData.performanceCount : 0;
        const studyScore = Math.min(100, (subjectData.minutes / 240) * 100);
        const enrollmentScore = Math.min(100, subjectData.enrollmentDays * 8);
        const searchScore = Math.min(100, subjectData.searches * 12);
        const overall = (avgPoints * 0.35) + (avgPerformance * 0.20) + (studyScore * 0.20) + (avgQuiz * 0.10) + (avgAssignment * 0.05) + (enrollmentScore * 0.05) + (searchScore * 0.05);
        return { subject, avgQuiz, avgAssignment, avgPoints, avgPerformance, studyScore, enrollmentScore, searches: subjectData.searches, overall };
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
    const subjectAssessment = {
        mathematics: { pointsTotal: 0, count: 0 },
        programming: { pointsTotal: 0, count: 0 },
        analytics: { pointsTotal: 0, count: 0 }
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

    assessmentHistory.forEach((item) => {
        const bucket = normalizeSubjectLabel(item.subject);
        if (!subjectAssessment[bucket]) {
            return;
        }
        const quizScore = Math.max(0, Math.min(100, readNumber(item.quizScore)));
        const assignmentMarks = Math.max(0, Math.min(100, readNumber(item.assignmentMarks ?? item.quizScore)));
        const points = Math.max(0, Math.min(100, readNumber(item.points ?? calculateAcademicScore(quizScore, assignmentMarks))));
        subjectAssessment[bucket].pointsTotal += points;
        subjectAssessment[bucket].count += 1;
    });

    const avgAssessmentMath = subjectAssessment.mathematics.count ? (subjectAssessment.mathematics.pointsTotal / subjectAssessment.mathematics.count) : 0;
    const avgAssessmentProgramming = subjectAssessment.programming.count ? (subjectAssessment.programming.pointsTotal / subjectAssessment.programming.count) : 0;
    const avgAssessmentAnalytics = subjectAssessment.analytics.count ? (subjectAssessment.analytics.pointsTotal / subjectAssessment.analytics.count) : 0;
    const globalAssessmentCount = subjectAssessment.mathematics.count + subjectAssessment.programming.count + subjectAssessment.analytics.count;
    const globalAssessmentPoints = subjectAssessment.mathematics.pointsTotal + subjectAssessment.programming.pointsTotal + subjectAssessment.analytics.pointsTotal;
    const avgAssessmentOverall = globalAssessmentCount ? (globalAssessmentPoints / globalAssessmentCount) : 0;

    const studyCompletion = Math.min(100, (totalMinutes / 600) * 100);
    const completion = Math.min(100, Math.round((studyCompletion * 0.7) + (avgAssessmentOverall * 0.3)));
    const mathScore = Math.min(100, Math.round(((subjectMinutes.mathematics / 240) * 100 * 0.55) + (avgAssessmentMath * 0.45)));
    const programmingScore = Math.min(100, Math.round(((subjectMinutes.programming / 240) * 100 * 0.55) + (avgAssessmentProgramming * 0.45)));
    const analyticsScore = Math.min(100, Math.round(((subjectMinutes.analytics / 240) * 100 * 0.55) + (avgAssessmentAnalytics * 0.45)));
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

    if (totalMinutes <= 0 && avgAssessmentOverall <= 0) {
        trendMessage.textContent = "Enroll in a course and log study minutes to start analytics.";
    } else if (avgAssessmentOverall >= 80) {
        trendMessage.textContent = "Strong assessment points trend. Keep converting this into consistent study time.";
    } else if (avgAssessmentOverall >= 60) {
        trendMessage.textContent = "Assessment trend is improving. Add more daily study time for faster gains.";
    } else if (completion >= 75) {
        trendMessage.textContent = "Consistency is improving this week.";
    } else if (completion >= 45) {
        trendMessage.textContent = "You are progressing steadily. Keep logging daily study time.";
    } else {
        trendMessage.textContent = "Early progress detected. Keep daily study sessions consistent.";
    }

    renderWeeklyChart(weekSeries);
    renderPersonalInsights();
    renderAssessmentMarksOverview();
    syncAssessmentInputsFromHistory();
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

function parseChatToSchoolProfile(message) {
    const text = message.toLowerCase();
    let subject = latestAssessment?.subject || "mathematics";
    let subjectExplicit = false;
    if (text.includes("english") || text.includes("writing") || text.includes("comprehension")) {
        subject = "english";
        subjectExplicit = true;
    } else if (text.includes("science") || text.includes("physics") || text.includes("chemistry") || text.includes("biology")) {
        subject = text.includes("physics") ? "physics" : (text.includes("chemistry") ? "chemistry" : "science");
        subjectExplicit = true;
    } else if (text.includes("social") || text.includes("group study") || text.includes("peer")) {
        subject = "social";
        subjectExplicit = true;
    } else if (text.includes("program") || text.includes("python") || text.includes("coding")) {
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

    const assignmentMarks = latestAssessment?.assignmentMarks ?? quizScore;
    const certification = text.includes("exam") || text.includes("certification");
    const intent = detectIntent({ query: text, certification, performance, quizScore, assignmentMarks });

    return { subject, subjectExplicit, style, performance, quizScore, assignmentMarks, intent };
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
        assignmentMarks: profile.assignmentMarks,
        points: calculateAcademicScore(profile.quizScore, profile.assignmentMarks),
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
    if (subject === "science" || subject === "physics" || subject === "chemistry") {
        return ["Statistics Basics", "School Data Interpretation Basics", "Probability for Beginners"];
    }
    if (subject === "english") {
        return ["Foundations of Algebra", "School Study Skills Bootcamp", "Exam Revision Sprint"];
    }
    if (subject === "social") {
        return ["School Study Skills Bootcamp", "Concept Videos and Visual Notes", "Exam Revision Sprint"];
    }
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

function getTargetDifficulty(performance, quizScore, assignmentMarks) {
    const academicScore = calculateAcademicScore(quizScore, assignmentMarks);
    if (performance === "low" || academicScore < 60) {
        return "beginner";
    }
    if (performance === "high" || academicScore > 80) {
        return "advanced";
    }
    return "intermediate";
}

function getCourseMeta(courseName) {
    if (courseNameLookupBySubject.mathematics.has(courseName)) {
        return { subject: "mathematics", difficulty: "beginner" };
    }
    if (courseNameLookupBySubject.programming.has(courseName)) {
        return {
            subject: "programming",
            difficulty: courseName.includes("Data Structures") ? "intermediate" : "beginner"
        };
    }
    if (courseNameLookupBySubject.analytics.has(courseName)) {
        return { subject: "analytics", difficulty: "intermediate" };
    }
    if (courseNameLookupBySubject.ai.has(courseName)) {
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

function recommendWithML({ grade, subject, intent, performance, quizScore, assignmentMarks, userVector, feedback }) {
    const gradeBoost = { school: 1, undergraduate: 0.75, postgraduate: 0.5 };
    const targetDifficulty = getTargetDifficulty(performance, quizScore, assignmentMarks);
    const mappedSubject = normalizeSubjectForModel(subject);
    const concern = feedback?.concern || "none";
    const freeText = (feedback?.text || "").toLowerCase();
    const targetSubjectPrefix = concern === "relevance"
        ? String(latestAssessment?.subject || "").slice(0, 4).toLowerCase()
        : "";
    const cacheKey = [
        grade,
        mappedSubject,
        intent,
        performance,
        targetDifficulty,
        concern,
        freeText,
        targetSubjectPrefix,
        userVector.join("|")
    ].join("::");
    const cached = recommendationCache.get(cacheKey);
    if (cached) {
        return cached.map((item) => ({ ...item }));
    }

    const rankedTop = [];
    for (const course of rankedCourseCatalog) {
        let score = cosineSimilarity(userVector, course.vector);
        const meta = courseMetaByName.get(course.name) || { subject: "general", difficulty: "intermediate" };

        if (course.level === grade) {
            score += gradeBoost[grade] * 0.2;
        } else if (course.level === "postgraduate") {
            score -= 0.18;
        }
        if (meta.subject === mappedSubject) {
            score += 0.35;
        } else if (meta.subject !== "general") {
            score -= 0.2;
        }
        if (meta.difficulty === targetDifficulty) {
            score += 0.16;
        } else if (targetDifficulty === "beginner" && meta.difficulty === "advanced") {
            score -= 0.14;
        }
        if (intent === "Certification preparation" && course.hasCertification) {
            score += 0.25;
        }
        if (intent === "Skill assessment" && course.hasDiagnostic) {
            score += 0.2;
        }

        if (concern === "difficulty") {
            if (course.hasBeginner || course.hasFoundations || course.hasDiagnostic) {
                score += 0.25;
            }
            if (course.hasMachineLearning || course.hasProjects) {
                score -= 0.15;
            }
        } else if (concern === "relevance") {
            if (targetSubjectPrefix && course.lowerName.includes(targetSubjectPrefix)) {
                score += 0.2;
            }
        } else if (concern === "clarity") {
            if (course.hasConcept || course.hasFoundations || course.hasVideos) {
                score += 0.22;
            }
        } else if (concern === "pace") {
            if (course.hasMentor || course.hasBeginner || course.hasDiagnostic) {
                score += 0.24;
            }
            if (course.hasProjects) {
                score -= 0.12;
            }
        }

        if (freeText.includes("math") && course.lowerName.includes("algebra")) {
            score += 0.12;
        }
        if (freeText.includes("program") && course.lowerName.includes("program")) {
            score += 0.12;
        }

        const result = { name: course.name, score: Math.max(0, Math.min(score, 1.9)) };
        let insertAt = rankedTop.length;
        while (insertAt > 0 && rankedTop[insertAt - 1].score < result.score) {
            insertAt -= 1;
        }
        if (insertAt < RECOMMENDATION_LIMIT) {
            rankedTop.splice(insertAt, 0, result);
            if (rankedTop.length > RECOMMENDATION_LIMIT) {
                rankedTop.pop();
            }
        }
    }

    const output = rankedTop.slice(0, RECOMMENDATION_LIMIT);
    recommendationCache.set(cacheKey, output.map((item) => ({ ...item })));
    if (recommendationCache.size > 200) {
        const firstKey = recommendationCache.keys().next().value;
        recommendationCache.delete(firstKey);
    }
    return output;
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

function renderImprovementSuggestions({ subject, performance, quizScore, assignmentMarks, intent, recommendations, query }) {
    const tips = [];
    const academicScore = calculateAcademicScore(quizScore, assignmentMarks);
    const focusCourse = recommendations?.[0]?.name;
    const weakTopics = detectWeakTopics(subject, query, performance, academicScore);
    const recentSameSubject = assessmentHistory
        .filter((item) => normalizeSubjectLabel(item.subject) === normalizeSubjectLabel(subject))
        .slice(-5);
    const averageRecentAcademic = recentSameSubject.length
        ? recentSameSubject.reduce((sum, item) => {
            const histQuiz = Math.max(0, Math.min(100, readNumber(item.quizScore)));
            const histAssignment = Math.max(0, Math.min(100, readNumber(item.assignmentMarks ?? item.quizScore)));
            return sum + calculateAcademicScore(histQuiz, histAssignment);
        }, 0) / recentSameSubject.length
        : academicScore;
    const subjectMinutes = Object.entries(resourceStudyMinutes).reduce((sum, [resourceId, minutes]) => {
        const resource = resourceLibrary.find((item) => item.id === resourceId);
        if (!resource) {
            return sum;
        }
        return normalizeSubjectLabel(resource.subject) === normalizeSubjectLabel(subject)
            ? sum + Math.max(0, readNumber(minutes))
            : sum;
    }, 0);

    if (performance === "low" || academicScore < 60) {
        tips.push(`Start with 30 minutes daily on ${subject} fundamentals and revise mistakes immediately after each practice set.`);
        tips.push("Take two short quizzes per week and track weak topics to avoid repeating the same errors.");
    } else if (performance === "high" || academicScore > 80) {
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
    if (averageRecentAcademic < 60) {
        tips.push(`Your recent ${subject} academic average is ${Math.round(averageRecentAcademic)}%. Focus on remedial modules before advanced topics.`);
    } else if (averageRecentAcademic >= 75) {
        tips.push(`Your recent ${subject} academic average is ${Math.round(averageRecentAcademic)}%. You can move to intermediate/advanced challenges.`);
    }
    if (subjectMinutes < 120) {
        tips.push(`You have logged only ${Math.round(subjectMinutes)} minutes in ${subject}. Add 20-30 minutes daily this week.`);
    }
    if (weakTopics.length) {
        tips.push(`Prioritize weak topics this week: ${weakTopics.join(", ")}.`);
        tips.push(`For each weak topic, practice 10 questions and note at least one mistake pattern.`);
    }

    tips.push("Track weekly improvement using combined quiz and assignment score trends.");

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
    const normalizedFilter = (filterValue === "physics" || filterValue === "chemistry") ? "science" : filterValue;
    const visibleResources = filterValue === "all"
        ? resourceLibrary
        : resourceLibrary.filter((item) => item.subject === normalizedFilter);

    resourceCatalog.innerHTML = "";

    if (!visibleResources.length) {
        resourceCatalog.innerHTML = '<p class="hint">No resources found for this subject.</p>';
        return;
    }

    visibleResources.forEach((item) => {
        const card = document.createElement("article");
        card.className = "resource-card";
        const certificationFrame = item.embed
            ? `<div class="resource-frame-wrap"><iframe class="resource-frame" src="${item.embed}" title="${item.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`
            : "";
        card.innerHTML = `
            <h4>${item.title}</h4>
            <p class="resource-meta">${item.type} | ${item.difficulty}</p>
            <p class="resource-desc">${item.description}</p>
            ${certificationFrame}
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

if (consentCheck) {
    consentCheck.checked = localStorage.getItem(CONSENT_STORAGE_KEY) === "true";
    syncConsentMessage(consentCheck.checked);
    consentCheck.addEventListener("change", () => {
        localStorage.setItem(CONSENT_STORAGE_KEY, consentCheck.checked ? "true" : "false");
        syncConsentMessage(consentCheck.checked);
        if (consentCheck.checked) {
            refreshRecommendationsFromLatestMarks("consent enabled");
        }
    });
}

assessmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
        const grade = "school";
        const subject = document.getElementById("subjectInterest").value;
        const style = document.getElementById("learningStyle").value;
        const performanceInput = document.getElementById("performance");
        const latestScores = getLatestScoresForSubject(subject);
        const quizScore = latestScores?.quizScore;
        const assignmentMarks = latestScores?.assignmentMarks;
        const rawQuery = document.getElementById("textQuery").value.trim();
        const query = rawQuery || `Need help in ${subject} with quiz ${quizScore} and assignment ${assignmentMarks}`;
        const certification = document.getElementById("goalCertification").checked;
        const academicScore = calculateAcademicScore(quizScore, assignmentMarks);
        const performance = derivePerformanceFromScores(quizScore, assignmentMarks);
        if (performanceInput) {
            performanceInput.value = performance;
        }

        if (!subject || !style) {
            assessmentSummary.textContent = "Assessment blocked: fill subject and learning style.";
            return;
        }

        if (!latestScores || !Number.isFinite(quizScore) || !Number.isFinite(assignmentMarks)) {
            assessmentSummary.textContent = "Assessment blocked: take quiz and assignment first so marks can be auto-used.";
            return;
        }

        if (!consentCheck.checked) {
            syncConsentMessage(false);
            assessmentSummary.textContent = "Assessment blocked: please check the consent box in Compliance Guardrails.";
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
            userVector,
            feedback: feedbackSignals
        });

        if (!recommendations.length) {
            assessmentSummary.textContent = "Assessment ran, but no recommendations were generated. Try changing subject/score.";
            recommendationList.innerHTML = "<li>No recommendations generated. Adjust inputs and run again.</li>";
            return;
        }

        latestAssessment = { grade, subject, style, performance, quizScore, assignmentMarks, query, intent, recommendations };
        assessmentHistory.push({
            subject,
            quizScore,
            assignmentMarks,
            points: academicScore,
            performance,
            query,
            timestamp: new Date().toISOString()
        });
        if (assessmentHistory.length > 100) {
            assessmentHistory.splice(0, assessmentHistory.length - 100);
        }
        saveAnalyzerState();

        intentResult.textContent = `Detected intent: ${intent}`;
        assessmentSummary.textContent = `Assessment summary: ${grade} learner, subject ${subject}, ${style} style, ${performance} performance, quiz ${quizScore}%, assignment ${assignmentMarks}%, academic score ${academicScore}%.`;
        renderRecommendationResults(recommendations);
        renderImprovementSuggestions({ subject, performance, quizScore, assignmentMarks, intent, recommendations, query });
    } catch (error) {
        assessmentSummary.textContent = `Assessment failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
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
            quizScore: latestAssessment.quizScore,
            assignmentMarks: latestAssessment.assignmentMarks ?? latestAssessment.quizScore
        });
        const tunedRecommendations = recommendWithML({
            grade: latestAssessment.grade,
            subject: latestAssessment.subject,
            intent: latestAssessment.intent,
            performance: latestAssessment.performance,
            quizScore: latestAssessment.quizScore,
            assignmentMarks: latestAssessment.assignmentMarks ?? latestAssessment.quizScore,
            userVector,
            feedback: feedbackSignals
        });
        latestAssessment.recommendations = tunedRecommendations;
        renderRecommendationResults(tunedRecommendations);
        renderImprovementSuggestions({
            subject: latestAssessment.subject,
            performance: latestAssessment.performance,
            quizScore: latestAssessment.quizScore,
            assignmentMarks: latestAssessment.assignmentMarks ?? latestAssessment.quizScore,
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

if (takeCourseQuizBtn) {
    takeCourseQuizBtn.addEventListener("click", () => {
        const enrolledItems = resourceLibrary.filter((item) => enrolledResourceIds.has(item.id));
        if (!enrolledItems.length) {
            if (studyLogStatus) {
                studyLogStatus.textContent = "Enroll in at least one course to generate quiz questions.";
            }
            return;
        }

        const subjects = enrolledItems
            .map((item) => String(item.subject || "").toLowerCase())
            .filter(Boolean);
        const encodedSubjects = encodeURIComponent(Array.from(new Set(subjects)).join(","));
        window.location.href = `Assessment.html?from=enrolled&subjects=${encodedSubjects}`;
    });
}

if (takeCourseAssignmentBtn) {
    takeCourseAssignmentBtn.addEventListener("click", () => {
        const enrolledItems = resourceLibrary.filter((item) => enrolledResourceIds.has(item.id));
        if (!enrolledItems.length) {
            if (studyLogStatus) {
                studyLogStatus.textContent = "Enroll in at least one course to generate assignment questions.";
            }
            return;
        }

        const subjects = enrolledItems
            .map((item) => String(item.subject || "").toLowerCase())
            .filter(Boolean);
        const encodedSubjects = encodeURIComponent(Array.from(new Set(subjects)).join(","));
        window.location.href = `Assignment.html?from=enrolled&subjects=${encodedSubjects}`;
    });
}

if (resourceFilter) {
    resourceFilter.addEventListener("change", () => {
        renderResourceCatalog();
    });
}

const subjectInterestInput = document.getElementById("subjectInterest");
if (subjectInterestInput) {
    subjectInterestInput.addEventListener("change", () => {
        syncAssessmentInputsFromHistory();
        refreshRecommendationsFromLatestMarks("subject change");
    });
}

function initializeDashboardAsync() {
    reloadAnalyzerStateAndRefresh("latest saved marks");

    // Catalog rendering is heavier; defer it to keep first paint responsive.
    setTimeout(() => {
        renderResourceCatalog();
    }, 0);
}

if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(initializeDashboardAsync);
} else {
    setTimeout(initializeDashboardAsync, 0);
}

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
        assignmentMarks: profile.assignmentMarks,
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

if (startFocusModeBtn) {
    startFocusModeBtn.addEventListener("click", startFocusSession);
}
if (endFocusModeBtn) {
    endFocusModeBtn.addEventListener("click", () => {
        endFocusSession("Focus session ended manually.");
    });
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        registerFocusDistraction("tab switch");
    } else {
        registerFocusReturn();
    }
});

window.addEventListener("blur", () => {
    registerFocusDistraction("window/app switch");
});

window.addEventListener("focus", () => {
    registerFocusReturn();
    reloadAnalyzerStateAndRefresh("window focus");
});

window.addEventListener("pageshow", () => {
    reloadAnalyzerStateAndRefresh("page return");
});

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        reloadAnalyzerStateAndRefresh("tab visible");
    }
});

window.addEventListener("storage", (event) => {
    if (event.key === ANALYZER_STORAGE_KEY) {
        reloadAnalyzerStateAndRefresh("storage update");
    }
});

loadFocusState();
if (focusDurationInput) {
    focusDurationInput.value = String(focusSession.durationMinutes);
}
syncFocusUI();
if (focusSession.active) {
    if (focusStatus) {
        focusStatus.textContent = `Resumed focus session (${focusSession.durationMinutes} min). Stay on this app.`;
    }
    startFocusTicker();
}

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("eduaiCurrentUser");
    window.location.href = "Frontend.html";
});
