require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const chatRouter = require("./routes/chat");
const profilesRouter = require("./routes/profiles");
const workoutsRouter = require("./routes/workouts");
const nutritionRouter = require("./routes/nutrition");

const app = express();
const PORT = process.env.PORT || 3050;

// ── Security middleware ─────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  })
);

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10kb" }));

// ── Rate limiting ───────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down and rest! 💪" },
});
app.use("/api/", limiter);

// ── Static frontend ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../public")));

// ── API routes ──────────────────────────────────────────────────
app.use("/api/chat", chatRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/workouts", workoutsRouter);
app.use("/api/nutrition", nutritionRouter);

// ── Health check ────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Fitness Buddy is live 🏃", timestamp: new Date().toISOString() });
});

// ── BUG FIX: error handler MUST come before catch-all and before app.listen
// Express identifies 4-arg middleware as an error handler only when declared
// before the server starts listening.
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong. Try again!" });
});

// ── BUG FIX: catch-all only for non-/api/ paths so API 404s are not swallowed
app.get(/^(?!\/api\/).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅  Fitness Buddy running at http://localhost:${PORT}`);
  console.log(`   Model: ${process.env.GRANITE_MODEL_ID || "meta-llama/llama-3-3-70b-instruct"}`);
});
