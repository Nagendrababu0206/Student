# Project Reviewer Q&A (EDUAI - School Recommendation Platform)

## 1) Project Purpose
Q: What problem does your project solve?
A: It helps school students get personalized study recommendations based on subject interest, performance, learning style, and quiz score.

Q: Why did you choose this topic?
A: I wanted to build something practical in EdTech where students can get guided learning paths instead of random resources.

## 2) Frontend and UI
Q: Which technologies did you use in frontend?
A: HTML, CSS, and JavaScript.

Q: How did you design responsiveness?
A: I used CSS grid layouts and media queries so cards and forms adapt on smaller screens.

Q: Why did you add dashboard graphics?
A: Visual elements like bar charts and progress indicators improve understanding of study status.

## 3) Authentication Flow
Q: How does login work in your project currently?
A: It uses client-side form validation and redirects to HomePage after success. User email is stored in localStorage for session-like behavior.

Q: Is this production-ready authentication?
A: No. It is a prototype flow. Production should use secure backend authentication and token/session management.

## 4) Recommendation Logic
Q: How does recommendation engine work?
A: It combines student inputs, intent detection, and an ML-style ranking approach to suggest top matching courses.

Q: What is intent detection here?
A: It classifies user goal such as skill assessment, topic exploration, or certification preparation based on text query and indicators.

Q: What ML concept did you implement?
A: Feature vector modeling + cosine similarity scoring to rank courses by relevance.

Q: Why cosine similarity?
A: It is simple, explainable, and suitable for profile-to-course matching in small datasets.

## 5) Chatbot
Q: What does chatbot do?
A: It answers school-student queries and provides school-only recommendations using current model logic.

Q: What happens if live API fails?
A: It automatically falls back to local ML-based chatbot response.

Q: Why keep local fallback?
A: It keeps chatbot functional even if backend API is down.

## 6) School-Only Scope
Q: How did you enforce school-only requirement?
A: Grade level is fixed to school in UI and recommendation logic always uses school scope while ranking.

Q: Why restrict scope?
A: Requirement was specifically for school students and it reduces wrong-level recommendations.

## 7) Compliance and Ethics
Q: What compliance guardrails are included?
A: Consent checkbox, no sensitive data in ranking, and transparent recommendation reasons.

Q: How do you handle privacy?
A: Minimal local data use in prototype. For real deployment, encryption, consent logging, and backend access control are required.

## 8) Limitations and Future Work
Q: Current limitations?
A: Static course catalog, no real student history model, no secure backend auth, and no persistent analytics database.

Q: Future improvements?
A: Add real backend model training pipeline, personalized history-based recommendations, and secured authentication APIs.

## 9) Testing
Q: How did you test this project?
A: Manual functional testing for forms, recommendation outputs, chatbot responses, fallback behavior, and navigation flow.

Q: What edge cases were checked?
A: Empty inputs, low/high quiz score, concern feedback variations, consent not given, and chatbot fallback mode.

## 10) Personal Contribution (Good Reviewer Answer)
Q: Which parts did you implement directly?
A: I implemented page structure, CSS layout, dashboard flow, recommendation logic integration, chatbot behavior, and user interaction wiring.
