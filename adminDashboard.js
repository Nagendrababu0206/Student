const refreshBtn = document.getElementById("refreshAdmin");
const kpiAssessments = document.getElementById("kpiAssessments");
const kpiEnrollments = document.getElementById("kpiEnrollments");
const kpiHours = document.getElementById("kpiHours");
const kpiAvgQuiz = document.getElementById("kpiAvgQuiz");
const donutProgress = document.getElementById("donutProgress");
const donutPercent = document.getElementById("donutPercent");
const subjectBars = document.getElementById("subjectBars");
const activityTrend = document.getElementById("activityTrend");
const weakSubjectRadar = document.getElementById("weakSubjectRadar");
const eventsList = document.getElementById("eventsList");

const STORAGE_KEY = "eduaiAnalyzerState";

function safeNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function readAdminPayload() {
    let payload = {};
    try {
        payload = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
        payload = {};
    }

    return {
        enrolledIds: Array.isArray(payload.enrolledIds) ? payload.enrolledIds : [],
        studyMinutes: payload.studyMinutes || {},
        dailyMinutes: payload.dailyMinutes || {},
        assessments: Array.isArray(payload.assessments) ? payload.assessments : []
    };
}

function normalizeSubject(subject) {
    const value = String(subject || "").toLowerCase();
    if (value === "ai") {
        return "programming";
    }
    if (value === "mathematics" || value === "programming" || value === "analytics") {
        return value;
    }
    return "analytics";
}

function getSubjectScores(assessments, studyMinutes) {
    const stats = {
        mathematics: { quizTotal: 0, quizCount: 0, minutes: 0 },
        programming: { quizTotal: 0, quizCount: 0, minutes: 0 },
        analytics: { quizTotal: 0, quizCount: 0, minutes: 0 }
    };

    assessments.forEach((item) => {
        const subject = normalizeSubject(item.subject);
        stats[subject].quizTotal += Math.max(0, Math.min(100, safeNumber(item.quizScore)));
        stats[subject].quizCount += 1;
    });

    Object.entries(studyMinutes).forEach(([resourceId, minutes]) => {
        const id = String(resourceId).toLowerCase();
        let subject = "analytics";
        if (id.includes("r1") || id.includes("r2") || id.includes("r9") || id.includes("r10")) {
            subject = "mathematics";
        } else if (id.includes("r3") || id.includes("r4") || id.includes("r11") || id.includes("r12") || id.includes("r7") || id.includes("r8") || id.includes("r15") || id.includes("r16")) {
            subject = "programming";
        }
        stats[subject].minutes += Math.max(0, safeNumber(minutes));
    });

    const keys = Object.keys(stats);
    return keys.map((subject) => {
        const avgQuiz = stats[subject].quizCount ? stats[subject].quizTotal / stats[subject].quizCount : 0;
        const studyScore = Math.min(100, (stats[subject].minutes / 240) * 100);
        return { subject, strength: (avgQuiz * 0.6) + (studyScore * 0.4), avgQuiz, studyScore };
    });
}

function drawDonut(engagementPercent) {
    const radius = 78;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, engagementPercent));
    const dashOffset = circumference - (circumference * clamped) / 100;
    donutProgress.style.strokeDasharray = `${circumference}`;
    donutProgress.style.strokeDashoffset = `${dashOffset}`;
    donutPercent.textContent = `${Math.round(clamped)}%`;
}

function drawSubjectBars(subjectCounts) {
    const labels = ["Mathematics", "Programming", "Analytics"];
    const keys = ["mathematics", "programming", "analytics"];
    const values = keys.map((key) => safeNumber(subjectCounts[key]));
    const max = Math.max(...values, 1);

    let svg = "";
    keys.forEach((key, idx) => {
        const value = values[idx];
        const barHeight = (value / max) * 140;
        const x = 56 + idx * 160;
        const y = 190 - barHeight;
        const color = idx === 0 ? "#22d3ee" : idx === 1 ? "#34d399" : "#f59e0b";
        svg += `<rect x="${x}" y="${y}" width="64" height="${barHeight}" rx="10" fill="${color}" opacity="0.82"></rect>`;
        svg += `<text x="${x + 32}" y="210" text-anchor="middle" fill="#93a3bf" font-size="12">${labels[idx]}</text>`;
        svg += `<text x="${x + 32}" y="${y - 8}" text-anchor="middle" fill="#e2e8f0" font-size="12">${value}</text>`;
    });
    subjectBars.innerHTML = svg;
}

function drawActivityTrend(dailyMinutes) {
    const points = [];
    const today = new Date();
    for (let i = 13; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        points.push(Math.max(0, safeNumber(dailyMinutes[key])) / 60);
    }

    const max = Math.max(...points, 1);
    const coords = points.map((value, index) => {
        const x = 24 + index * 37;
        const y = 180 - ((value / max) * 140);
        return `${x},${y}`;
    }).join(" ");

    activityTrend.innerHTML = `
        <polyline fill="none" stroke="#22d3ee" stroke-width="3" points="${coords}"></polyline>
        <polyline fill="none" stroke="rgba(245,158,11,0.8)" stroke-width="1" points="24,180 542,180"></polyline>
    `;
}

function drawWeakRadar(subjectScores) {
    const bySubject = {};
    subjectScores.forEach((item) => {
        bySubject[item.subject] = item.strength;
    });

    const subjects = ["mathematics", "programming", "analytics"];
    const labels = ["Math", "Prog/AI", "Analytics"];
    const centerX = 180;
    const centerY = 140;
    const maxRadius = 90;

    let axes = "";
    let polygonPoints = "";
    subjects.forEach((subject, idx) => {
        const angle = (-Math.PI / 2) + (idx * (2 * Math.PI / subjects.length));
        const ax = centerX + Math.cos(angle) * maxRadius;
        const ay = centerY + Math.sin(angle) * maxRadius;
        axes += `<line x1="${centerX}" y1="${centerY}" x2="${ax}" y2="${ay}" stroke="rgba(148,163,184,0.3)"></line>`;
        axes += `<text x="${centerX + Math.cos(angle) * 108}" y="${centerY + Math.sin(angle) * 108}" fill="#93a3bf" font-size="11" text-anchor="middle">${labels[idx]}</text>`;

        const strength = Math.max(0, Math.min(100, safeNumber(bySubject[subject] || 0)));
        const r = (strength / 100) * maxRadius;
        const px = centerX + Math.cos(angle) * r;
        const py = centerY + Math.sin(angle) * r;
        polygonPoints += `${px},${py} `;
    });

    weakSubjectRadar.innerHTML = `
        <circle cx="${centerX}" cy="${centerY}" r="30" fill="none" stroke="rgba(148,163,184,0.2)"></circle>
        <circle cx="${centerX}" cy="${centerY}" r="60" fill="none" stroke="rgba(148,163,184,0.2)"></circle>
        <circle cx="${centerX}" cy="${centerY}" r="${maxRadius}" fill="none" stroke="rgba(148,163,184,0.2)"></circle>
        ${axes}
        <polygon points="${polygonPoints.trim()}" fill="rgba(245,158,11,0.25)" stroke="#f59e0b" stroke-width="2"></polygon>
    `;
}

function renderEvents(assessments) {
    const recent = assessments.slice(-6).reverse();
    if (!recent.length) {
        eventsList.innerHTML = '<p class="hint">No events available yet.</p>';
        return;
    }

    eventsList.innerHTML = "";
    recent.forEach((item) => {
        const when = item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown time";
        const card = document.createElement("div");
        card.className = "event-item";
        card.innerHTML = `
            <div><strong>${String(item.subject || "unknown").toUpperCase()}</strong> | Quiz ${Math.round(safeNumber(item.quizScore))}% | ${String(item.performance || "medium")}</div>
            <div class="event-time">${when}</div>
        `;
        eventsList.appendChild(card);
    });
}

function renderAdminDashboard() {
    const payload = readAdminPayload();
    const totalAssessments = payload.assessments.length;
    const totalEnrollments = payload.enrolledIds.length;
    const totalMinutes = Object.values(payload.studyMinutes).reduce((sum, val) => sum + Math.max(0, safeNumber(val)), 0);
    const avgQuiz = totalAssessments
        ? payload.assessments.reduce((sum, item) => sum + Math.max(0, Math.min(100, safeNumber(item.quizScore))), 0) / totalAssessments
        : 0;

    const subjectCounts = { mathematics: 0, programming: 0, analytics: 0 };
    payload.assessments.forEach((item) => {
        const subject = normalizeSubject(item.subject);
        subjectCounts[subject] += 1;
    });

    const subjectScores = getSubjectScores(payload.assessments, payload.studyMinutes);
    const engagement = Math.min(100, (totalMinutes / 900) * 100);

    kpiAssessments.textContent = String(totalAssessments);
    kpiEnrollments.textContent = String(totalEnrollments);
    kpiHours.textContent = `${(totalMinutes / 60).toFixed(1)}h`;
    kpiAvgQuiz.textContent = `${Math.round(avgQuiz)}%`;

    drawDonut(engagement);
    drawSubjectBars(subjectCounts);
    drawActivityTrend(payload.dailyMinutes);
    drawWeakRadar(subjectScores);
    renderEvents(payload.assessments);
}

refreshBtn?.addEventListener("click", renderAdminDashboard);
renderAdminDashboard();
