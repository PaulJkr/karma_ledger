<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Karma Ledger API

Karma Ledger is a backend application built with NestJS that allows users to track their positive and negative actions ("karma"). The application uses AI to analyze these actions, provide insightful feedback, and offer personalized suggestions for personal growth. It includes gamification features like a weekly leaderboard and achievement badges to keep users engaged.

## ✨ Core Features

*   **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens).
*   **Karma Tracking**: Users can log "Karma Events"—actions they've taken—with optional reflections.
*   **AI-Powered Analysis**:
    *   **Intensity Scoring**: Each karma event is asynchronously analyzed by Google's Gemini AI to assign a "karma intensity" score (from -1 to +10).
    *   **Personalized Feedback**: The AI provides encouraging and constructive feedback for each logged action.
    *   **Weekly Suggestions**: The system can generate personalized, actionable suggestions for the user based on their weekly activity.
*   **Asynchronous Job Processing**: Uses **BullMQ** and **Redis** to handle time-consuming AI analysis in the background, ensuring the API remains fast and responsive.
*   **Gamification**:
    *   **Leaderboard**: A weekly leaderboard ranks the top 10 users based on their current week's average karma score.
    *   **Badges & Achievements**: An event-driven system awards badges for milestones like logging the first action, receiving a suggestion, or making the top 10.
*   **Dynamic Database Support**:
    *   Uses **SQLite** for easy setup in development.
    *   Configured for **PostgreSQL** in production environments.
*   **API Documentation**: Integrated **Swagger** for comprehensive and interactive API documentation.

## 🛠️ Tech Stack

*   **Framework**: [NestJS](https://nestjs.com/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [Sequelize](https://sequelize.org/) ORM with support for [PostgreSQL](https://www.postgresql.org/) (production) & [SQLite](https://www.sqlite.org/index.html) (development)
*   **Authentication**: [Passport.js](http://www.passportjs.org/) (JWT Strategy)
*   **Background Jobs**: [BullMQ](https://bullmq.io/) with [Redis](https://redis.io/)
*   **AI**: [Google Gemini API](https://ai.google.dev/)
*   **Validation**: [class-validator](https://github.com/typestack/class-validator) & [class-transformer](https://github.com/typestack/class-transformer)
*   **Configuration**: `@nestjs/config`

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
*   [Docker](https://www.docker.com/) and Docker Compose (recommended for running Redis & PostgreSQL)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-name>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, fill in the `.env` file with your configuration.

```dotenv
# Application Configuration
NODE_ENV=development # 'development' or 'production'
PORT=3000
SERVER_URL=http://localhost:3000

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d

# Google Gemini AI
GOOGLE_API_KEY=your-google-api-key
GEMINI_MODEL_NAME=gemini-1.5-flash

# --- Development Settings (NODE_ENV=development) ---
# Redis for BullMQ (local)
REDIS_HOST=localhost
REDIS_PORT=6379

# Database (SQLite)
SQLITE_STORAGE=db.sqlite

# --- Production Settings (NODE_ENV=production) ---
# Redis for BullMQ (e.g., Redis Cloud, Upstash)
REDIS_URL=redis://:password@host:port

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_NAME=karma_ledger
```

### 4. Run Supporting Services (Redis & Postgres)

If you have Docker installed, you can easily start Redis and PostgreSQL. Create a `docker-compose.yml` file with the content below and run `docker-compose up -d`.

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:13
    container_name: karma-postgres
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432" # Use your DB_PORT if different
    volumes:
      - postgres_data:/var/lib/postgresql/data
  redis:
    image: redis:6-alpine
    container_name: karma-redis
    ports:
      - "6379:6379" # Use your REDIS_PORT if different
volumes:
  postgres_data:
```

### 5. Run the Application

```bash
# Development mode with hot-reloading
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📖 API Documentation

Once the application is running, you can access the interactive Swagger API documentation at:

**[http://localhost:3000](http://localhost:3000)**

This UI provides a complete list of endpoints, request/response schemas, and allows you to test the API directly. Remember to authorize your requests by clicking the "Authorize" button and providing a JWT token obtained from the login endpoint.

## 🌊 Flow of Events

Understanding the sequence of operations is key to understanding the application. Here are the flows for the most important features.

### Flow 1: Logging a New Karma Event

This flow demonstrates the asynchronous nature of the application, providing a fast API response to the user while processing the heavy AI task in the background.

```
User Client           | NestJS API Server                                 | BullMQ (Redis) Queue    | Background Worker
----------------------|---------------------------------------------------|-------------------------|---------------------------------
1. POST /karma-events |                                                   |                         |
   /create            |                                                   |                         |
   (with action)      |                                                   |                         |
   --[Request]-->     | 2. KarmaEventService: Creates KarmaEvent in DB    |                         |
                      |    (intensity=null, feedback_generated=false)     |                         |
                      |                                                   |                         |
                      | 3. KarmaEventService: Adds job to 'karma_feedback'|                         |
                      |    queue with event details.                      | --[Job Added]-->        |
                      |                                                   |                         |
                      | 4. KarmaEventService: Emits 'FIRST_ACTION' event  |                         |
                      |    if it's the user's first event.                |                         |
                      |                                                   |                         |
                      | 5. BadgeListener: Catches event and awards badge. |                         |
                      |                                                   |                         |
                      | 6. API immediately returns 201 Created response.  |                         |
<--[Response]--       |                                                   |                         |
                      |                                                   |                         |
                      |                                                   |                         | 8. KarmaFeedbackProcessor:
                      |                                                   |                         |    Picks up the job.
                      |                                                   | <---[Pulls Job]--       |
                      |                                                   |                         |
                      |                                                   |                         | 9. AiService: Calls Gemini API
                      |                                                   |                         |    to get intensity & feedback.
                      |                                                   |                         |
                      |                                                   |                         | 10. KarmaEventService:
                      | 11. DB: KarmaEvent record is updated with         |                         |     Updates the KarmaEvent
                      |     AI-generated data.                            |                         |     record in the database.
                      | <---------------------------------------------------------------------------|
```

**Steps:**
1.  **API Request**: The user sends a `POST` request to `/karma-events/create` with their action.
2.  **Synchronous Actions**: The `KarmaEventService` immediately:
    *   Creates a `KarmaEvent` record in the database with placeholder data.
    *   Adds a job to the `karma_feedback` **BullMQ** queue. This job contains the information needed for AI analysis (`karmaEventId`, `userId`, `action`).
    *   Emits internal application events (e.g., `BadgeEvents.FIRST_ACTION`) using `@nestjs/event-emitter`. These are handled instantly by listeners like the `BadgeListener` to award achievements.
    *   Sends a `201 Created` response back to the user. **The user does not wait for the AI.**
3.  **Asynchronous Processing**:
    *   Later, the `KarmaFeedbackProcessor` (a BullMQ worker) picks up the job from the Redis queue.
    *   It calls the `AiService`, which communicates with the Google Gemini API.
    *   Once the AI response is received, the worker calls the `KarmaEventService` to update the original `KarmaEvent` record in the database with the `intensity` score and `feedback` text.

### Flow 2: Generating Weekly Suggestions

This flow is also asynchronous and is typically triggered manually by the user or could be automated with a cron job.

```
User Client           | NestJS API Server                                 | BullMQ (Redis) Queue     | Background Worker
----------------------|---------------------------------------------------|--------------------------|---------------------------------
1. GET /dashboard     |                                                   |                          |
   /trigger-suggestions                                                   |                          |
   --[Request]-->     | 2. DashboardService: Adds job to                  |                          |
                      |    'karma_suggestion' queue.                      | --[Job Added]-->         |
                      |                                                   |                          |
                      | 3. API returns 200 OK response.                   |                          |
<--[Response]--       |                                                   |                          |
                      |                                                   |                          | 4. SuggestionsProcessor:
                      |                                                   |                          |    Picks up the job.
                      |                                                   | <---[Pulls Job]--        |
                      |                                                   |                          |
                      |                                                   |                          | 5. Fetches user's weekly
                      |                                                   |                          |    KarmaEvents from DB.
                      |                                                   |                          |
                      |                                                   |                          | 6. AiService: Calls Gemini
                      |                                                   |                          |    with events to get suggestions.
                      |                                                   |                          |
                      |                                                   |                          | 7. Saves new Suggestion
                      | 8. DB: New suggestion records are created.        |                          |    records to the database.
                      | <----------------------------------------------------------------------------|
```

## 🏛️ Project Architecture

The project is structured into several NestJS modules, each responsible for a specific domain:

*   `AppModule`: The root module that ties everything together, including database, queue, and configuration setup.
*   `AuthModule`: Handles user registration, login, and JWT strategy.
*   `UsersModule`: Manages user data and profiles.
*   `KarmaEventModule`: Manages the creation and retrieval of karma events. It initiates background jobs for AI processing and emits events for the badge system.
*   `DashboardModule`: Provides data for the user dashboard, including suggestions, leaderboards, and badges. It contains the background job processor for generating AI suggestions.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.