/**
 * Workout logic module
 * Generates structured workout plans based on user parameters
 */

const EXERCISES = {
  beginner: {
    warmup: [
      { name: "Jumping Jacks", duration: "60 sec" },
      { name: "Arm Circles", duration: "30 sec each direction" },
      { name: "Hip Circles", duration: "30 sec each direction" },
      { name: "High Knees", duration: "30 sec" },
      { name: "Neck Rolls", duration: "30 sec" },
    ],
    bodyweight: [
      { name: "Squats", reps: "12-15", muscles: "legs, glutes" },
      { name: "Knee Push-Ups", reps: "8-10", muscles: "chest, arms" },
      { name: "Reverse Lunges", reps: "10 each leg", muscles: "legs, balance" },
      { name: "Glute Bridges", reps: "15", muscles: "glutes, lower back" },
      { name: "Plank Hold", duration: "20-30 sec", muscles: "core" },
      { name: "Superman Hold", reps: "10", muscles: "lower back" },
      { name: "Wall Sit", duration: "20 sec", muscles: "quads" },
      { name: "Calf Raises", reps: "20", muscles: "calves" },
    ],
    cooldown: [
      { name: "Quad Stretch", duration: "30 sec each leg" },
      { name: "Hamstring Stretch", duration: "30 sec each leg" },
      { name: "Child's Pose", duration: "60 sec" },
      { name: "Chest Opener", duration: "30 sec" },
      { name: "Deep Breathing", duration: "1 min" },
    ],
  },
  intermediate: {
    warmup: [
      { name: "Jumping Jacks", duration: "90 sec" },
      { name: "Dynamic Leg Swings", duration: "30 sec each leg" },
      { name: "Inchworms", reps: "5" },
      { name: "Hip Circles", duration: "30 sec" },
      { name: "High Knees", duration: "45 sec" },
    ],
    bodyweight: [
      { name: "Jump Squats", reps: "15", muscles: "legs, cardio" },
      { name: "Push-Ups", reps: "15-20", muscles: "chest, arms, core" },
      { name: "Walking Lunges", reps: "12 each leg", muscles: "legs, balance" },
      { name: "Mountain Climbers", duration: "40 sec", muscles: "core, cardio" },
      { name: "Burpees", reps: "10", muscles: "full body, cardio" },
      { name: "Tricep Dips (chair)", reps: "12", muscles: "arms" },
      { name: "Plank with Shoulder Taps", reps: "20", muscles: "core, stability" },
      { name: "Lateral Lunges", reps: "10 each side", muscles: "inner thighs, glutes" },
      { name: "Pike Push-Ups", reps: "10", muscles: "shoulders" },
    ],
    cooldown: [
      { name: "Pigeon Pose", duration: "45 sec each side" },
      { name: "Spinal Twist", duration: "30 sec each side" },
      { name: "Standing Quad Stretch", duration: "30 sec each leg" },
      { name: "Doorway Chest Stretch", duration: "30 sec" },
      { name: "Deep Breathing", duration: "1 min" },
    ],
  },
  advanced: {
    warmup: [
      { name: "Jump Rope (or simulate)", duration: "2 min" },
      { name: "Dynamic Stretching Circuit", duration: "2 min" },
      { name: "Inchworms with Push-Up", reps: "6" },
      { name: "Lateral Bounds", reps: "10 each side" },
    ],
    bodyweight: [
      { name: "Pistol Squats (or assisted)", reps: "8 each leg", muscles: "legs, balance" },
      { name: "Plyometric Push-Ups", reps: "10-12", muscles: "chest, power" },
      { name: "Bulgarian Split Squats", reps: "12 each leg", muscles: "legs, glutes" },
      { name: "Burpee Pull-Ups (or Burpees)", reps: "10", muscles: "full body" },
      { name: "Pike Push-Ups", reps: "15", muscles: "shoulders" },
      { name: "Tuck Jumps", reps: "12", muscles: "legs, cardio" },
      { name: "L-Sit Hold (floor)", duration: "15-20 sec", muscles: "core, arms" },
      { name: "Handstand Practice (wall)", duration: "30 sec", muscles: "shoulders, core" },
      { name: "Dragon Flags (modified)", reps: "6-8", muscles: "core" },
    ],
    cooldown: [
      { name: "Pigeon Pose", duration: "60 sec each side" },
      { name: "Full Spinal Twist", duration: "45 sec each side" },
      { name: "Standing Forward Fold", duration: "60 sec" },
      { name: "Shoulder Cross Stretch", duration: "30 sec each" },
      { name: "Foam Roll (or floor roll)", duration: "2 min" },
    ],
  },
};

const CARDIO_OPTIONS = {
  beginner: [
    { name: "Brisk Walking", duration: "15 min" },
    { name: "Step Touch Side to Side", duration: "10 min" },
    { name: "Low-Impact March", duration: "10 min" },
  ],
  intermediate: [
    { name: "HIIT: 30 sec on / 15 sec off", rounds: 8, exercises: ["High Knees", "Jumping Jacks", "Squat Jumps"] },
    { name: "Jogging in Place", duration: "15 min" },
    { name: "Stair Climbing", duration: "10 min" },
  ],
  advanced: [
    { name: "Tabata: 20 sec on / 10 sec off", rounds: 8, exercises: ["Burpees", "Mountain Climbers", "Jump Squats", "Sprint in Place"] },
    { name: "AMRAP Circuit", duration: "15 min", exercises: ["10 Burpees", "20 Mountain Climbers", "15 Jump Squats"] },
    { name: "Sprint Intervals", description: "8×30 sec max effort / 30 sec rest" },
  ],
};

// BUG FIX: declare VALID_LEVELS before it is used by getWorkoutPlan
const VALID_LEVELS = ["beginner", "intermediate", "advanced"];

/**
 * Determine number of workout sets based on time and level
 */
function getSets(level, timeMinutes) {
  const warmupCooldown = 10; // fixed 5 min warmup + 5 min cooldown
  const workTime = timeMinutes - warmupCooldown;
  if (level === "beginner") return Math.max(1, Math.floor(workTime / 10));
  if (level === "intermediate") return Math.max(2, Math.floor(workTime / 8));
  return Math.max(2, Math.floor(workTime / 6));
}

/**
 * Generate a workout plan object
 */
function getWorkoutPlan({ level, time, equipment, goal, injuries }) {
  const lvl = VALID_LEVELS.includes(level) ? level : "beginner";
  const exercises = EXERCISES[lvl];
  const cardioOpts = CARDIO_OPTIONS[lvl];
  const sets = getSets(lvl, time);

  // Pick exercises based on time and goal
  let mainExercises = [...exercises.bodyweight];

  // For weight_loss / endurance, add a cardio block
  const includeCardio = goal === "weight_loss" || goal === "endurance";
  const cardio = includeCardio ? cardioOpts[Math.floor(Math.random() * cardioOpts.length)] : null;

  // Pick subset of exercises if time is tight
  const maxExercises = Math.min(mainExercises.length, time <= 20 ? 5 : time <= 35 ? 7 : 9);
  mainExercises = mainExercises.slice(0, maxExercises);

  // Injury modifications
  const modifications = getInjuryModifications(injuries);

  return {
    level: lvl,
    totalDuration: `${time} minutes`,
    sets,
    goal,
    equipment,
    warmup: exercises.warmup.slice(0, 4),
    mainExercises,
    cardio,
    cooldown: exercises.cooldown,
    modifications: modifications.length ? modifications : null,
    restBetweenSets: lvl === "beginner" ? "90 sec" : lvl === "intermediate" ? "60 sec" : "45 sec",
    tip: getMotivationalTip(lvl, goal),
  };
}

function getInjuryModifications(injuries) {
  if (!injuries) return [];
  const mods = [];
  const inj = injuries.toLowerCase();
  if (inj.includes("knee")) {
    mods.push("Replace jump squats with slow squats", "Use chair support for lunges", "Skip high-impact moves");
  }
  if (inj.includes("back") || inj.includes("spine")) {
    mods.push("Avoid deep forward bends", "Keep core braced during all moves", "Replace burpees with step-jacks");
  }
  if (inj.includes("shoulder") || inj.includes("rotator")) {
    mods.push("Skip overhead presses", "Replace push-ups with wall push-ups", "No lateral raises");
  }
  if (inj.includes("wrist")) {
    mods.push("Use fists for push-ups to keep wrist neutral", "Skip plank variations on flat hands — use forearms");
  }
  return mods;
}

function getMotivationalTip(level, goal) {
  const tips = {
    weight_loss: "Consistency beats intensity! 3 workouts a week beats 1 brutal session. 🔥",
    muscle_gain: "Progressive overload is key — add a rep or a second each week. 💪",
    endurance: "Your lungs will adapt! Each session builds your aerobic base. 🏃",
    general_health: "Movement is medicine. You're investing in your future self. 🌟",
  };
  return tips[goal] || tips.general_health;
}

module.exports = { getWorkoutPlan };
