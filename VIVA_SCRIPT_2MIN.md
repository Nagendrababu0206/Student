# 2-Minute Viva Script (EDUAI Project)

Good morning. My project is **EDUAI**, a school-focused learning recommendation platform.

The main goal of this project is to help school students identify what to study next based on their profile and current performance.

In the frontend, I used **HTML, CSS, and JavaScript**.
I created three major flows:
1. Landing and authentication pages,
2. Student dashboard with study analytics,
3. Recommendation workflow with chatbot support.

In the dashboard, students can see study hours, completion status, progress indicators, and a focus plan.
Then they can fill a structured form with subject interest, learning style, performance level, and quiz score.

After input, the system performs:
- intent detection,
- need assessment,
- and recommendation generation.

For recommendations, I implemented an **ML-style ranking approach** using:
- feature vectors for user profile and courses,
- cosine similarity for matching,
- and confidence scoring for top results.

I also added a **school-only chatbot**.
It gives recommendation answers in natural language and keeps responses within school scope.
The chatbot has two modes:
- local ML mode,
- optional live API mode with fallback to local mode if API fails.

I included compliance guardrails such as consent checkbox, transparent recommendation reasons, and reduced sensitive-data dependency.

Current limitations are that authentication is prototype-level and the course catalog is static.
In future, I plan to add secure backend authentication, database storage, and a trained backend recommendation service.

Thank you.
