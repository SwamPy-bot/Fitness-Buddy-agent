# 💪 Fitness Buddy — AI Health & Fitness Coach

An AI-powered fitness coaching web app built on **IBM Watsonx.ai Granite**, featuring personalized workout plans, nutrition guidance, family profiles, progress tracking, and motivational support.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **AI Chat Coach** | Conversational fitness guidance powered by IBM Granite LLM |
| 🏋️ **Workout Generator** | Personalized plans for Beginner → Advanced, 15–60 min, any equipment |
| 🥗 **Nutrition Guidance** | Indian cuisine support (roti, dal, idli, dosa, rajma...) + macro info |
| 👨‍👩‍👧 **Family Profiles** | Up to 5 profiles with independent goals and plans |
| 📊 **Progress Tracking** | Workout streaks, total sessions, recent history |
| ⚕️ **Safety Guards** | Blocks dangerous advice, adds medical disclaimers automatically |
| 🔒 **Rate Limiting** | 100 req/15 min, helmet security headers |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
node scripts/setup.js   # Creates .env from .env.example
```
Then edit `.env`:
```env
WATSONX_API_KEY=your_ibm_cloud_api_key
WATSONX_PROJECT_ID=your_watsonx_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL_ID=ibm/granite-13b-chat-v2
```

> **Note:** If you skip Watsonx credentials, the app runs with smart built-in fallback responses.

### 3. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

---

## 🔑 IBM Watsonx.ai Setup

1. Sign up at [cloud.ibm.com](https://cloud.ibm.com)
2. Create a **Watsonx.ai** project
3. Generate an **API key** from IAM → Service credentials
4. Copy your **Project ID** from the Watsonx project settings
5. Paste both into `.env`

---

## 📁 Project Structure

```
fitness-buddy-agent/
├── server/
│   ├── index.js              # Express server entry point
│   ├── watsonx.js            # IBM Watsonx.ai Granite integration
│   ├── db.js                 # JSON file database (lowdb)
│   ├── routes/
│   │   ├── chat.js           # POST /api/chat — main conversation
│   │   ├── profiles.js       # CRUD /api/profiles + progress
│   │   ├── workouts.js       # GET /api/workouts/generate
│   │   └── nutrition.js      # GET /api/nutrition/suggest
│   └── modules/
│       ├── workoutLogic.js   # Workout plan generator
│       ├── nutritionGuide.js # Meal suggestion engine
│       └── safetyGuard.js    # Safety boundary checks
├── public/
│   └── index.html            # Full chat UI (single-page app)
├── data/
│   └── db.json               # Auto-created; stores profiles & chats
├── scripts/
│   └── setup.js              # First-run .env setup helper
├── .env.example              # Environment template
└── package.json
```

---

## 🌐 API Reference

### Chat
```
POST /api/chat
{ "message": "string", "sessionId": "string?", "profileId": "string?" }
→ { "reply": "string", "sessionId": "string" }
```

### Profiles
```
GET    /api/profiles              — list all profiles
POST   /api/profiles              — create profile
PUT    /api/profiles/:id          — update profile
DELETE /api/profiles/:id          — delete profile
POST   /api/profiles/:id/log-workout   — log a session
GET    /api/profiles/:id/progress — get stats + history
```

### Workouts
```
GET /api/workouts/generate?level=beginner&time=20&equipment=none&goal=weight_loss
```

### Nutrition
```
GET /api/nutrition/suggest?goal=weight_loss&diet=vegetarian&meals=3
```

---

## ⚕️ Safety

- Never recommends dangerous calorie restriction (<900 kcal)
- Blocks steroid/PED discussions
- Redirects eating disorder language to helplines
- Always appends medical disclaimer for health-related queries
- Rate limited to prevent abuse

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **AI:** IBM Watsonx.ai (`@ibm-cloud/watsonx-ai`) — Granite 13B Chat
- **Database:** lowdb (JSON file — zero infrastructure)
- **Frontend:** Vanilla HTML/CSS/JS (no framework, no build step)
- **Security:** Helmet.js, express-rate-limit, input validation

---

*Built with ❤️ on IBM Watsonx.ai Granite*
