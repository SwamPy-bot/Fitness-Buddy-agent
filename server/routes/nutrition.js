/**
 * Nutrition route
 * GET /api/nutrition/suggest?goal=weight_loss&diet=vegetarian&meals=3
 */
const express = require("express");
const router = express.Router();
const { getMealSuggestions } = require("../modules/nutritionGuide");

router.get("/suggest", (req, res) => {
  const { goal, diet, meals } = req.query;
  try {
    const suggestions = getMealSuggestions({
      goal: goal || "general_health",
      diet: diet || "non-vegetarian",
      meals: Number(meals) || 3,
    });
    res.json({ suggestions });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
