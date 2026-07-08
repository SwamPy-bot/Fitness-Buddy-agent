/**
 * Nutrition guidance module
 * Suggests meal plans with Indian cuisine support
 */

const MEALS = {
  vegetarian: {
    weight_loss: {
      breakfast: [
        { name: "Moong Dal Cheela", desc: "2 cheelas with mint chutney", macros: "P: 12g  C: 28g  F: 4g" },
        { name: "Poha with Veggies", desc: "1 bowl with peanuts and lemon", macros: "P: 7g  C: 35g  F: 5g" },
        { name: "Idli Sambar", desc: "3 idlis with sambar and chutney", macros: "P: 9g  C: 40g  F: 2g" },
        { name: "Oats Upma", desc: "1 bowl with vegetables", macros: "P: 8g  C: 30g  F: 4g" },
      ],
      lunch: [
        { name: "Dal + Roti + Sabzi", desc: "1 cup masoor dal, 2 rotis, seasonal sabzi", macros: "P: 18g  C: 60g  F: 8g" },
        { name: "Rajma Chawal (small portion)", desc: "¾ cup rajma, ½ cup brown rice", macros: "P: 16g  C: 55g  F: 5g" },
        { name: "Mixed Veg Khichdi", desc: "1 bowl with ghee and curd", macros: "P: 12g  C: 48g  F: 7g" },
        { name: "Chole with 2 Rotis", desc: "¾ cup chole, salad on side", macros: "P: 15g  C: 52g  F: 6g" },
      ],
      dinner: [
        { name: "Palak Paneer (light) + 1 Roti", desc: "½ cup palak paneer, 1 multigrain roti", macros: "P: 14g  C: 25g  F: 10g" },
        { name: "Vegetable Soup + Toast", desc: "Large bowl tomato-vegetable soup", macros: "P: 6g  C: 22g  F: 3g" },
        { name: "Moong Dal + Roti", desc: "1 cup dal, 1 roti, salad", macros: "P: 13g  C: 35g  F: 4g" },
      ],
      snacks: [
        { name: "Roasted Chana", desc: "Small handful (~30g)", macros: "P: 7g  C: 14g  F: 3g" },
        { name: "Fruit + Curd", desc: "1 small apple + 100g low-fat curd", macros: "P: 5g  C: 20g  F: 1g" },
        { name: "Cucumber & Carrot Sticks", desc: "With hummus", macros: "P: 4g  C: 12g  F: 5g" },
      ],
    },
    muscle_gain: {
      breakfast: [
        { name: "Paneer Bhurji + 2 Rotis", desc: "100g paneer scramble with veggies", macros: "P: 22g  C: 45g  F: 14g" },
        { name: "Besan Cheela + Curd", desc: "3 cheelas with 150g curd", macros: "P: 18g  C: 40g  F: 8g" },
        { name: "Dosa + Sambar", desc: "2 dosas with sambar", macros: "P: 10g  C: 50g  F: 6g" },
      ],
      lunch: [
        { name: "Soya Chunks + Rice + Dal", desc: "50g soya, 1 cup rice, 1 cup dal", macros: "P: 32g  C: 70g  F: 7g" },
        { name: "Paneer Curry + 3 Rotis", desc: "100g paneer curry, veggies", macros: "P: 24g  C: 65g  F: 15g" },
        { name: "Rajma Rice (full portion)", desc: "1 cup rajma, 1 cup rice", macros: "P: 20g  C: 75g  F: 5g" },
      ],
      dinner: [
        { name: "Paneer Tikka + 2 Rotis", desc: "Grilled paneer with salad", macros: "P: 28g  C: 40g  F: 12g" },
        { name: "Tofu Stir-fry + Brown Rice", desc: "100g tofu, veggies", macros: "P: 16g  C: 50g  F: 8g" },
      ],
      snacks: [
        { name: "Peanut Butter on Toast", desc: "1 tbsp PB on whole wheat toast", macros: "P: 8g  C: 18g  F: 9g" },
        { name: "Protein Smoothie", desc: "Banana + milk + peanut butter", macros: "P: 14g  C: 35g  F: 6g" },
        { name: "Mixed Nuts & Seeds", desc: "30g mix (almonds, walnuts, seeds)", macros: "P: 7g  C: 8g  F: 18g" },
      ],
    },
    endurance: {
      breakfast: [
        { name: "Banana Oatmeal", desc: "Oats with banana, honey, nuts", macros: "P: 9g  C: 55g  F: 7g" },
        { name: "Whole Wheat Paratha + Curd", desc: "2 parathas, 150g curd", macros: "P: 12g  C: 58g  F: 10g" },
      ],
      lunch: [
        { name: "Rice + Dal + Sabzi", desc: "1 cup rice, 1 cup dal, seasonal veg", macros: "P: 16g  C: 75g  F: 6g" },
        { name: "Brown Rice Khichdi", desc: "With ghee and pickle", macros: "P: 14g  C: 70g  F: 8g" },
      ],
      dinner: [
        { name: "Dal + 2 Rotis + Salad", desc: "Mixed dal, salad", macros: "P: 15g  C: 50g  F: 5g" },
      ],
      snacks: [
        { name: "Banana", desc: "1 medium banana", macros: "P: 1g  C: 27g  F: 0g" },
        { name: "Dates & Nuts", desc: "3-4 dates + handful nuts", macros: "P: 4g  C: 30g  F: 8g" },
      ],
    },
    general_health: {
      breakfast: [
        { name: "Idli + Sambar + Chutney", desc: "3 idlis, balanced meal", macros: "P: 9g  C: 40g  F: 2g" },
        { name: "Upma with Veggies", desc: "1 bowl semolina upma", macros: "P: 7g  C: 38g  F: 5g" },
        { name: "Poha", desc: "1 bowl with peas and potato", macros: "P: 6g  C: 40g  F: 4g" },
      ],
      lunch: [
        { name: "Thali (small)", desc: "Dal, 2 rotis, sabzi, curd, salad", macros: "P: 16g  C: 60g  F: 8g" },
        { name: "Sambar Rice", desc: "1 cup rice with vegetable sambar", macros: "P: 12g  C: 65g  F: 4g" },
      ],
      dinner: [
        { name: "Soup + Roti + Sabzi", desc: "Light meal with vegetables", macros: "P: 10g  C: 35g  F: 5g" },
      ],
      snacks: [
        { name: "Buttermilk (Chaas)", desc: "1 glass with cumin", macros: "P: 4g  C: 5g  F: 1g" },
        { name: "Fruit Salad", desc: "Seasonal fruits with chaat masala", macros: "P: 2g  C: 25g  F: 0g" },
      ],
    },
  },
  vegan: {
    weight_loss: {
      breakfast: [
        { name: "Oats with Almond Milk", desc: "With berries and seeds", macros: "P: 8g  C: 35g  F: 6g" },
        { name: "Moong Sprout Chaat", desc: "Sprouts with lemon and spices", macros: "P: 10g  C: 22g  F: 1g" },
      ],
      lunch: [
        { name: "Tofu Sabzi + Roti", desc: "Tofu and vegetable curry, 2 rotis", macros: "P: 18g  C: 55g  F: 8g" },
        { name: "Chole + Brown Rice", desc: "¾ cup chole, ½ cup rice", macros: "P: 14g  C: 52g  F: 5g" },
      ],
      dinner: [
        { name: "Lentil Soup + Toast", desc: "Thick masoor soup, 2 slices whole wheat", macros: "P: 13g  C: 38g  F: 3g" },
      ],
      snacks: [
        { name: "Roasted Chana", desc: "Small handful", macros: "P: 7g  C: 14g  F: 3g" },
        { name: "Fruit + Nuts", desc: "1 apple, 10 almonds", macros: "P: 3g  C: 25g  F: 7g" },
      ],
    },
    general_health: {
      breakfast: [
        { name: "Dosa + Sambar", desc: "2 dosas with coconut chutney", macros: "P: 8g  C: 48g  F: 5g" },
      ],
      lunch: [
        { name: "Dal + Rice + Sabzi", desc: "Standard South Indian thali", macros: "P: 14g  C: 65g  F: 5g" },
      ],
      dinner: [
        { name: "Mixed Dal Soup", desc: "Thick, spiced with vegetables", macros: "P: 13g  C: 35g  F: 3g" },
      ],
      snacks: [
        { name: "Coconut Water", desc: "1 glass fresh", macros: "P: 1g  C: 10g  F: 0g" },
      ],
    },
    muscle_gain: {
      breakfast: [
        { name: "Soya Milk Smoothie", desc: "Soya milk, banana, peanut butter, oats", macros: "P: 18g  C: 50g  F: 9g" },
      ],
      lunch: [
        { name: "Soya Chunks Curry + Rice", desc: "50g soya, 1 cup rice", macros: "P: 28g  C: 70g  F: 7g" },
      ],
      dinner: [
        { name: "Tofu & Vegetable Stir-fry", desc: "100g tofu, seasonal veggies", macros: "P: 16g  C: 30g  F: 8g" },
      ],
      snacks: [
        { name: "Peanut Butter Toast", desc: "1 tbsp on multigrain toast", macros: "P: 8g  C: 18g  F: 9g" },
      ],
    },
    endurance: {
      breakfast: [
        { name: "Banana Oat Smoothie", desc: "Oats, banana, almond milk", macros: "P: 8g  C: 58g  F: 5g" },
      ],
      lunch: [
        { name: "Rajma + Brown Rice", desc: "1 cup rajma, 1 cup rice", macros: "P: 18g  C: 78g  F: 4g" },
      ],
      dinner: [
        { name: "Lentil Dal + 2 Rotis", desc: "Energy-dense meal", macros: "P: 15g  C: 55g  F: 4g" },
      ],
      snacks: [
        { name: "Dates + Almonds", desc: "3 dates, 12 almonds", macros: "P: 4g  C: 28g  F: 9g" },
      ],
    },
  },
};

// Non-veg uses vegetarian as base + protein additions
const NON_VEG_ADDITIONS = {
  weight_loss: {
    breakfast: [
      { name: "Egg White Omelette", desc: "3 egg whites with veggies", macros: "P: 16g  C: 5g  F: 2g" },
      { name: "Boiled Eggs + Toast", desc: "2 boiled eggs, 1 slice whole wheat toast", macros: "P: 14g  C: 18g  F: 10g" },
    ],
    lunch: [
      { name: "Chicken Dal + Roti", desc: "Grilled chicken (100g) + dal + 2 rotis", macros: "P: 36g  C: 52g  F: 8g" },
      { name: "Fish Curry + Rice", desc: "Grilled/steamed fish (120g), ½ cup rice", macros: "P: 28g  C: 40g  F: 6g" },
    ],
    dinner: [
      { name: "Grilled Chicken Salad", desc: "100g chicken breast, veggies, lemon dressing", macros: "P: 30g  C: 12g  F: 6g" },
      { name: "Egg Bhurji + Roti", desc: "2-egg scramble, 1 roti", macros: "P: 18g  C: 28g  F: 10g" },
    ],
    snacks: [
      { name: "Hard-Boiled Egg", desc: "1 whole egg", macros: "P: 6g  C: 0g  F: 5g" },
    ],
  },
  muscle_gain: {
    breakfast: [
      { name: "Egg Omelette + Paratha", desc: "3-egg omelette, 2 parathas, milk", macros: "P: 28g  C: 55g  F: 16g" },
    ],
    lunch: [
      { name: "Chicken Rice Bowl", desc: "150g grilled chicken, 1 cup rice, salad", macros: "P: 42g  C: 65g  F: 8g" },
      { name: "Mutton Curry + 3 Rotis", desc: "Medium portion mutton curry", macros: "P: 35g  C: 60g  F: 15g" },
    ],
    dinner: [
      { name: "Paneer/Chicken Mix Curry", desc: "50g paneer + 75g chicken", macros: "P: 38g  C: 20g  F: 14g" },
    ],
    snacks: [
      { name: "Chicken Tikka (dry)", desc: "50g snack portion", macros: "P: 14g  C: 2g  F: 4g" },
    ],
  },
  endurance: {
    breakfast: [
      { name: "Eggs + Oats", desc: "2 boiled eggs, 1 bowl oats with banana", macros: "P: 18g  C: 60g  F: 11g" },
    ],
    lunch: [
      { name: "Fish + Rice + Dal", desc: "120g fish, 1 cup rice, dal", macros: "P: 32g  C: 72g  F: 8g" },
    ],
    dinner: [
      { name: "Grilled Chicken + Sabzi + Roti", desc: "100g chicken, 2 rotis", macros: "P: 32g  C: 40g  F: 8g" },
    ],
    snacks: [
      { name: "Boiled Egg + Banana", desc: "Pre-workout fuel", macros: "P: 8g  C: 27g  F: 5g" },
    ],
  },
  general_health: {
    breakfast: [
      { name: "Eggs + Toast", desc: "2 scrambled eggs, 2 slices toast", macros: "P: 16g  C: 30g  F: 12g" },
    ],
    lunch: [
      { name: "Chicken Curry + Rice + Dal", desc: "Standard non-veg thali", macros: "P: 32g  C: 62g  F: 10g" },
    ],
    dinner: [
      { name: "Grilled Fish + Roti + Salad", desc: "Light, balanced dinner", macros: "P: 26g  C: 30g  F: 6g" },
    ],
    snacks: [
      { name: "Egg Boiled", desc: "1 hard-boiled egg + fruit", macros: "P: 6g  C: 20g  F: 5g" },
    ],
  },
};

const HYDRATION_TIPS = [
  "Drink at least 8 glasses (2L) of water daily.",
  "Sip water every 20 minutes during workouts.",
  "Coconut water is excellent post-workout for electrolytes.",
  "Start your morning with a glass of warm water with lemon.",
  "Carry a water bottle everywhere — visual cues help you drink more.",
  "Avoid sugary drinks; opt for nimbu pani (unsweetened) or chaas.",
];

const PRE_POST_SNACKS = {
  pre_workout: [
    "Banana + 1 glass milk (30 min before)",
    "2 dates + 10 almonds (20 min before)",
    "1 slice whole wheat toast + peanut butter",
    "Small bowl poha or upma",
  ],
  post_workout: [
    "Curd + banana (within 30 min)",
    "2 boiled eggs + glass of milk",
    "Paneer tikka or chicken tikka (small portion)",
    "Protein smoothie: banana + milk + peanut butter",
    "Dal + roti (within 1 hour)",
  ],
};

function getMealSuggestions({ goal, diet, meals }) {
  const validGoals = ["weight_loss", "muscle_gain", "endurance", "general_health"];
  const g = validGoals.includes(goal) ? goal : "general_health";

  let mealBase;
  if (diet === "vegan") {
    mealBase = MEALS.vegan[g] || MEALS.vegan.general_health;
  } else if (diet === "non-vegetarian") {
    // Merge veg base with non-veg additions
    const vegBase = MEALS.vegetarian[g] || MEALS.vegetarian.general_health;
    const nvAdd = NON_VEG_ADDITIONS[g] || NON_VEG_ADDITIONS.general_health;
    mealBase = {
      breakfast: [...(vegBase.breakfast || []), ...(nvAdd.breakfast || [])],
      lunch: [...(vegBase.lunch || []), ...(nvAdd.lunch || [])],
      dinner: [...(vegBase.dinner || []), ...(nvAdd.dinner || [])],
      snacks: [...(vegBase.snacks || []), ...(nvAdd.snacks || [])],
    };
  } else {
    mealBase = MEALS.vegetarian[g] || MEALS.vegetarian.general_health;
  }

  // Pick random meals for the requested meal count
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const plan = {
    goal: g,
    diet,
    meals: [],
    hydrationTip: HYDRATION_TIPS[Math.floor(Math.random() * HYDRATION_TIPS.length)],
    preWorkoutSnack: PRE_POST_SNACKS.pre_workout[Math.floor(Math.random() * PRE_POST_SNACKS.pre_workout.length)],
    postWorkoutSnack: PRE_POST_SNACKS.post_workout[Math.floor(Math.random() * PRE_POST_SNACKS.post_workout.length)],
  };

  if (meals >= 1) plan.meals.push({ type: "Breakfast", ...pick(mealBase.breakfast) });
  if (meals >= 2) plan.meals.push({ type: "Lunch", ...pick(mealBase.lunch) });
  if (meals >= 3) plan.meals.push({ type: "Dinner", ...pick(mealBase.dinner) });
  if (meals >= 4) plan.meals.push({ type: "Snack", ...pick(mealBase.snacks) });

  return plan;
}

module.exports = { getMealSuggestions };
