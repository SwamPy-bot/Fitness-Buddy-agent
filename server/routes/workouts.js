/**
 * Workout generator route
 * GET /api/workouts/generate?level=beginner&time=20&equipment=none&goal=weight_loss
 */
const express = require("express");
const router = express.Router();
const { getWorkoutPlan } = require("../modules/workoutLogic");

router.get("/generate", (req, res) => {
  const { level, time, equipment, goal, injuries } = req.query;
  try {
    const plan = getWorkoutPlan({
      level: level || "beginner",
      time: Number(time) || 20,
      equipment: equipment || "none",
      goal: goal || "general_health",
      injuries: injuries || "",
    });
    res.json({ plan });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
