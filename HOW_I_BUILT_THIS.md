# How I Built This Project (EDUAI)

## 1. Goal
I built a school-focused learning recommendation web app where students can:
- enter profile and learning preferences,
- receive course recommendations,
- interact with a recommendation chatbot,
- and track a simple study dashboard.

## 2. Stack Used
- HTML for page structure
- CSS for styling and responsive layout
- JavaScript for form validation, recommendation logic, chatbot interaction, and page behavior

## 3. Build Process
### Step 1: Landing + Auth Screens
I started with landing, login, and registration pages.
I improved structure and design so users can clearly choose login or sign up.

### Step 2: Post-login Dashboard
I created a student home dashboard with:
- key metrics cards,
- bar-chart-style analytics,
- progress indicators,
- focus plan section.

### Step 3: Workflow Features
I added a complete recommendation workflow:
- user input form,
- intent detection,
- need assessment fields,
- recommendation output,
- feedback handling,
- engagement actions,
- compliance guardrails (consent and transparency notes).

### Step 4: ML-style Recommendation Logic
I implemented an explainable ranking method:
- convert user profile to feature vector,
- keep course vectors in a catalog,
- rank using cosine similarity,
- show top matches with confidence percentage.

### Step 5: School-Only Scope
I restricted the recommendation flow to school students by fixing grade scope and school-focused chatbot answers.

### Step 6: Chatbot
I added a chatbot panel that:
- responds with school-only recommendations,
- reads simple intent from user text,
- supports "last recommendation" recall,
- supports optional live API mode with local fallback.

## 4. Key Decisions
- Used plain JS for clarity and easy explanation.
- Used cosine similarity because it is transparent and reviewer-friendly.
- Added fallback mode so chatbot still works without API dependency.

## 5. What I Learned
- Designing user flow from login to guided recommendations.
- Converting educational requirements into structured UI and logic.
- Building a simple ML-inspired recommendation model in frontend JavaScript.
- Handling graceful fallback between remote and local chatbot logic.

## 6. Current Gaps
- Authentication is prototype-level (not production secure).
- Course dataset is small and static.
- No backend database for long-term student analytics.

## 7. Next Improvements
- Add backend auth and secure session management.
- Move recommendation model to backend service.
- Store progress and feedback in a database.
- Train on real historical learning outcomes.
