# PrepTrack — Placement Preparation Platform

> Complete full-stack placement readiness web application with **MongoDB & Mongoose**, Express.js, React (Vite), and Node.js. Built specifically for MongoDB Course Assignments (CA) and viva demonstrations.

---

## 📌 Project Overview

**PrepTrack** is a centralized platform for college students preparing for technical campus placements and off-campus recruitment drives. It incorporates:
1. **Adaptive Practice Tests**: Native MongoDB `$sample` aggregation to generate randomized mock tests with server-side grading and answer obfuscation.
2. **Spaced Repetition Prep Tracker**: Intelligent revision scheduler (`1, 3, 7, 15, 30 days`) using Mongoose document middleware and atomic `$inc` / `$set` operators.
3. **Job & Internship Tracker**: Recruitment pipeline manager with near-deadline (72-hour) visual warnings and inline status state transitions.
4. **Real-time Analytics Dashboard**: Complex multi-stage MongoDB aggregations calculating category accuracy, score trends, weak-topic identification, and stage funnels.
5. **Secure Authentication**: JWT with bcrypt salted password hashing and Mongoose projection safeguards (`select: false`).

---

## 🛠 Tech Stack

- **Database**: MongoDB (Local `127.0.0.1:27017` or MongoDB Atlas Cloud)
- **Object Data Modeling (ODM)**: Mongoose (v8+)
- **Backend API**: Node.js & Express.js
- **Frontend App**: React 18 with Vite
- **Styling**: Vanilla CSS design system (Dark mode, glassmorphic navbar, responsive grid)
- **Data Visualization**: Recharts (LineChart, BarChart)
- **Icons**: Lucide React
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **MongoDB**: Either local MongoDB Community Service running on port `27017` OR a MongoDB Atlas cloud URI.

### 2. Environment Variables Configuration
The server configuration is located in `server/.env`.
```env
PORT=5000
# Local MongoDB connection (default):
MONGO_URI=mongodb://127.0.0.1:27017/preptrack

# MongoDB Atlas connection (uncomment and replace credentials if using Cloud):
# MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/preptrack?retryWrites=true&w=majority

JWT_SECRET=preptrack_dev_secret
JWT_EXPIRES_IN=7d
```

### 3. Installation
From the `preptrack/` root directory (or outer directory):
```bash
npm run install-all
```
This installs dependencies across the root, `server/`, and `client/`.

### 4. Seed Questions Database
PrepTrack includes 60 real placement MCQs across Aptitude, CS Core, Development, and DSA:
```bash
npm run seed
```

### 5. Seed Demo User Account
Populates sample prep topics, job applications, and past test attempts:
```bash
npm run seed:demo
```
**Demo Account Credentials:**
- **Email**: `demo@preptrack.com`
- **Password**: `Demo@123`

### 6. Run the Application
Run both backend and frontend servers together using `concurrently`:
```bash
npm run dev
```
- **Backend Server**: `http://localhost:5000`
- **Frontend Web App**: `http://localhost:3000`

### 7. Deploy from GitHub with Render
The repository includes a Render Blueprint (`render.yaml`) that deploys the API and
React client as separate services. Push the repository to GitHub, then in Render
choose **New > Blueprint**, connect the repository, and apply the Blueprint.

When prompted, provide `MONGO_URI` using a MongoDB Atlas connection string. Render
generates `JWT_SECRET` automatically. The client API URL is linked to the API service
by the Blueprint, and pushes to the connected branch trigger new deployments.
The chatbot uses its built-in responses unless `GEMINI_API_KEY` is configured as a
secret environment variable for the API service.

---

## 📡 API Reference & Example Payloads

### 1. Health Check
- `GET /api/health`
  - Response: `{ "status": "ok", "uptime": 60, "db": "connected" }`

### 2. Authentication
- `POST /api/auth/register`
  - Body:
    ```json
    {
      "name": "Rohan Verma",
      "email": "rohan@example.com",
      "password": "Password@123"
    }
    ```
- `POST /api/auth/login`
  - Body:
    ```json
    {
      "email": "demo@preptrack.com",
      "password": "Demo@123"
    }
    ```
- `GET /api/auth/me` (Bearer Token required)

### 3. Question Bank
- `GET /api/questions?category=DSA&difficulty=Medium&q=tree&page=1&limit=10`
  - Supports filters, full-text search (`$text`), and pagination.

### 4. Practice Tests
- `POST /api/tests/start`
  - Body: `{ "category": "DSA", "difficulty": "Medium", "count": 10 }`
  - Returns randomized questions with `correctIndex` and `explanation` excluded via `$project`.
- `POST /api/tests/submit`
  - Body:
    ```json
    {
      "questionIds": ["6ae659ee48f3675e3ed610f7", "6ae659ee48f3675e3ed610f8"],
      "answers": [
        { "questionId": "6ae659ee48f3675e3ed610f7", "selectedIndex": 2 },
        { "questionId": "6ae659ee48f3675e3ed610f8", "selectedIndex": 1 }
      ],
      "timeTakenSec": 120,
      "category": "DSA"
    }
    ```
  - Returns score, accuracy, streak update, and complete answer explanations.
- `GET /api/tests/history?page=1&limit=10`
- `GET /api/tests/:id` (Populates referenced questions)

### 5. Prep Tracker (Spaced Repetition)
- `POST /api/prep`
  - Body:
    ```json
    {
      "category": "DSA",
      "title": "Floyd Cycle Detection",
      "topic": "Linked Lists",
      "difficulty": "Medium",
      "status": "Done",
      "notes": "Slow moves 1, Fast moves 2"
    }
    ```
- `GET /api/prep?category=DSA&status=Todo`
- `GET /api/prep/revise-today` (Filters `nextRevisionDate <= now`)
- `PUT /api/prep/:id/revised` (Advances revision interval and increments count)
- `PUT /api/prep/:id`
- `DELETE /api/prep/:id`

### 6. Applications Tracker
- `POST /api/applications`
  - Body:
    ```json
    {
      "company": "Google",
      "role": "Software Engineer",
      "status": "Interview",
      "deadline": "2026-11-04T12:00:00.000Z",
      "notes": "Round 2 technical round on Google Meet"
    }
    ```
- `GET /api/applications?status=Interview`
- `PUT /api/applications/:id` (Inline stage update)
- `DELETE /api/applications/:id`

### 7. Performance Analytics & Aggregations
- `GET /api/stats/accuracy-by-category`
- `GET /api/stats/weak-topics`
- `GET /api/stats/score-trend`
- `GET /api/stats/applications-funnel`
- `GET /api/dashboard/plan`

### 8. AI Placement Query Assistant (Chatbot)
- `POST /api/chat/message`
  - Body: `{ "message": "Explain $lookup in MongoDB with an aggregation example" }`
  - Returns structured technical interview explanation, code snippets, and viva tips.
- `GET /api/chat/history`: Retrieves user's past 50 conversation messages from MongoDB.
- `DELETE /api/chat/history`: Clears conversation history.

---

## 📂 Project Architecture

```
preptrack/
├── package.json              # Monorepo root script runner (concurrently)
├── README.md                 # Project guide & API docs
├── MONGODB_FEATURES.md       # Comprehensive MongoDB viva questions & features table
├── AGGREGATION_NOTES.md      # Pipeline stage breakdown with I/O examples
├── server/
│   ├── config/db.js          # Mongoose connection & error lifecycle
│   ├── models/               # User, Question, TestAttempt, PrepItem, Application
│   ├── controllers/          # Business logic & aggregation pipelines
│   ├── routes/               # Express modular REST endpoints
│   ├── middleware/           # JWT auth and central error handling
│   ├── seed/                 # 60 questions seed & demo user populator
│   ├── app.js                # Express app setup & CORS
│   ├── server.js             # Server listener
│   └── .env                  # Environment config
└── client/
    ├── src/
    │   ├── api/axios.js      # Axios instance with JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/       # Navbar, ProtectedRoute
    │   ├── pages/            # Login, Register, Dashboard, Practice, PrepTracker, Applications
    │   ├── App.jsx           # Client router
    │   └── index.css         # Custom modern design system
    ├── index.html
    └── vite.config.js        # Vite config with backend proxy
```
