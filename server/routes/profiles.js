/**
 * Profiles route — manage up to 5 user profiles per account
 * GET/POST/PUT/DELETE /api/profiles
 */
const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");

const VALID_FITNESS_LEVELS = ["beginner", "intermediate", "advanced"];
const VALID_GOALS = ["weight_loss", "muscle_gain", "endurance", "general_health"];
const VALID_EQUIPMENT = ["none", "minimal", "full"];
const VALID_DIET = ["vegetarian", "non-vegetarian", "vegan"];

function validateProfile(data) {
  const errors = [];
  if (!data.name || typeof data.name !== "string") errors.push("name is required");
  if (data.fitnessLevel && !VALID_FITNESS_LEVELS.includes(data.fitnessLevel))
    errors.push(`fitnessLevel must be one of: ${VALID_FITNESS_LEVELS.join(", ")}`);
  if (data.goal && !VALID_GOALS.includes(data.goal))
    errors.push(`goal must be one of: ${VALID_GOALS.join(", ")}`);
  if (data.equipment && !VALID_EQUIPMENT.includes(data.equipment))
    errors.push(`equipment must be one of: ${VALID_EQUIPMENT.join(", ")}`);
  if (data.dietaryPreference && !VALID_DIET.includes(data.dietaryPreference))
    errors.push(`dietaryPreference must be one of: ${VALID_DIET.join(", ")}`);
  if (data.age && (isNaN(data.age) || data.age < 5 || data.age > 120))
    errors.push("age must be between 5 and 120");
  if (data.availableTime && (isNaN(data.availableTime) || data.availableTime < 1 || data.availableTime > 300))
    errors.push("availableTime must be 1–300 minutes");
  return errors;
}

// GET all profiles
router.get("/", (req, res) => {
  const profiles = db.get("profiles").value();
  res.json({ profiles });
});

// GET single profile
router.get("/:id", (req, res) => {
  const profile = db.get("profiles").find({ id: req.params.id }).value();
  if (!profile) return res.status(404).json({ error: "Profile not found." });
  res.json({ profile });
});

// POST create profile
router.post("/", (req, res) => {
  const profiles = db.get("profiles").value();

  const errors = validateProfile(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const profile = {
    id: uuidv4(),
    name: req.body.name.trim(),
    age: req.body.age ? Number(req.body.age) : null,
    gender: req.body.gender || null,
    fitnessLevel: req.body.fitnessLevel || "beginner",
    goal: req.body.goal || "general_health",
    availableTime: req.body.availableTime ? Number(req.body.availableTime) : 30,
    equipment: req.body.equipment || "none",
    injuries: req.body.injuries || null,
    dietaryPreference: req.body.dietaryPreference || "non-vegetarian",
    scheduleConstraints: req.body.scheduleConstraints || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  db.get("profiles").push(profile).write();
  res.status(201).json({ profile });
});

// PUT update profile
router.put("/:id", (req, res) => {
  const existing = db.get("profiles").find({ id: req.params.id }).value();
  if (!existing) return res.status(404).json({ error: "Profile not found." });

  const errors = validateProfile({ ...existing, ...req.body });
  if (errors.length) return res.status(400).json({ errors });

  // BUG FIX: strip server-managed fields so a client cannot overwrite them
  const { id, createdAt, totalWorkouts, currentStreak, longestStreak, ...allowedUpdates } = req.body;

  const updated = {
    ...allowedUpdates,
    id: existing.id,
    createdAt: existing.createdAt,
    totalWorkouts: existing.totalWorkouts,
    currentStreak: existing.currentStreak,
    longestStreak: existing.longestStreak,
    updatedAt: new Date().toISOString(),
  };

  db.get("profiles").find({ id: req.params.id }).assign(updated).write();
  res.json({ profile: db.get("profiles").find({ id: req.params.id }).value() });
});

// DELETE profile
router.delete("/:id", (req, res) => {
  const existing = db.get("profiles").find({ id: req.params.id }).value();
  if (!existing) return res.status(404).json({ error: "Profile not found." });
  db.get("profiles").remove({ id: req.params.id }).write();
  res.json({ success: true });
});

// POST log workout completion
router.post("/:id/log-workout", (req, res) => {
  const profile = db.get("profiles").find({ id: req.params.id }).value();
  if (!profile) return res.status(404).json({ error: "Profile not found." });

  const logEntry = {
    id: uuidv4(),
    profileId: req.params.id,
    date: new Date().toISOString(),
    workoutType: req.body.workoutType || "general",
    durationMinutes: req.body.durationMinutes || 0,
    notes: req.body.notes || "",
  };

  db.get("progress").push(logEntry).write();

  const newTotal = (profile.totalWorkouts || 0) + 1;

  // BUG FIX: streak should reset to 1 if last workout was more than 1 day ago
  let newStreak = 1;
  if (profile.lastWorkoutDate) {
    const last = new Date(profile.lastWorkoutDate);
    const now = new Date();
    // Diff in whole calendar days
    const diffDays = Math.floor(
      (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
        Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) /
        86400000
    );
    if (diffDays <= 1) {
      // Same day or consecutive day — extend streak
      newStreak = (profile.currentStreak || 0) + (diffDays === 1 ? 1 : 0);
      // If logging a second time today keep streak as-is (don't double-count)
      if (diffDays === 0) newStreak = profile.currentStreak || 1;
    }
    // diffDays > 1 → streak broken, reset to 1 (already set above)
  }

  const newLongest = Math.max(profile.longestStreak || 0, newStreak);

  db.get("profiles")
    .find({ id: req.params.id })
    .assign({
      totalWorkouts: newTotal,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastWorkoutDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .write();

  res.json({ success: true, logEntry, stats: { totalWorkouts: newTotal, currentStreak: newStreak, longestStreak: newLongest } });
});

// GET progress history for profile
router.get("/:id/progress", (req, res) => {
  const profile = db.get("profiles").find({ id: req.params.id }).value();
  if (!profile) return res.status(404).json({ error: "Profile not found." });
  const logs = db.get("progress").filter({ profileId: req.params.id }).value();
  res.json({ profile: { name: profile.name, totalWorkouts: profile.totalWorkouts, currentStreak: profile.currentStreak, longestStreak: profile.longestStreak }, logs });
});

module.exports = router;
