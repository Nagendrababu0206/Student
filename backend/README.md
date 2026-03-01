# EDUAI Java Backend

Spring Boot backend for login, registration, and school-only recommendation chatbot.

## Tech
- Java 17
- Spring Boot 3
- Maven

## Run
1. Open terminal in `backend/`
2. Run:

```bash
mvn spring-boot:run
```

Backend starts on: `http://localhost:3001`

## Endpoints
- `GET /api/health`
- `POST /api/register`
- `POST /api/login`
- `POST /api/recommend-chat`

### Register request
```json
{
  "name": "Student",
  "phone": "9876543210",
  "email": "student1@eduai.com",
  "password": "Password1"
}
```

### Login request
```json
{
  "username": "student@eduai.com",
  "password": "Password1"
}
```

### Recommend chat request
```json
{
  "message": "recommend for math low score 45",
  "scope": "school_students_only",
  "latestAssessment": null
}
```

## Frontend integration
- `Script.js` -> `POST /api/login`
- `Signup.js` -> `POST /api/register`
- `homePage.js` live AI toggle -> `POST /api/recommend-chat`

## Notes
- User data is stored in memory for prototype usage.
- Restarting backend resets registered users.
