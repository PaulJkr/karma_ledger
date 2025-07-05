# ✨ Karma Ledger: A Full-Stack AI-Powered Personal Growth Tracker

Welcome to Karma Ledger! This is a full-stack application designed to help users track their daily actions, gain self-awareness through AI-driven insights, and foster personal growth in a gamified environment.

This repository contains the complete source code for both the backend API and the frontend client application.

-   **Live Demo:** `soon` 
-   **Backend API Docs:** `https://karma-ledger.onrender.com` (Optional)

---

## 🚀 Core Features

*   **Intuitive Dashboard:** A clean, responsive user interface to log actions and view progress.
*   **AI-Powered Analysis:** Actions are analyzed by Google's Gemini AI to provide an "intensity score" and personalized, encouraging feedback.
*   **Weekly Growth Suggestions:** The AI generates actionable, personalized goals for the user each week based on their activity.
*   **Gamification:** Earn achievement badges for milestones and compete on a weekly leaderboard to stay motivated.
*   **Secure Authentication:** End-to-end user authentication using JWT (JSON Web Tokens).
*   **Asynchronous Processing:** The backend uses a job queue with Redis to handle AI analysis without slowing down the user experience.

## 🛠️ Tech Stack

| Area      | Technology                                                                                                  |
| :-------- | :---------------------------------------------------------------------------------------------------------- |
| **Backend** | [NestJS](https://nestjs.com/), [TypeScript](https://www.typescriptlang.org/), [Sequelize](https://sequelize.org/) (PostgreSQL/SQLite), [BullMQ](https://bullmq.io/) & [Redis](https://redis.io/), [Google Gemini API](https://ai.google.dev/), [Passport.js](http://www.passportjs.org/) (JWT) |
| **Frontend**  | [React](https://reactjs.org/) (or Vue/Angular), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/) (or Material-UI), [Axios](https://axios-http.com/), [TanStack Query](https://tanstack.com/query/latest)          |
| **DevOps**    | [Docker](https://www.docker.com/) & [Docker Compose](https://www.docker.com/products/docker-compose/) for containerized development and deployment.                                   |


## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
