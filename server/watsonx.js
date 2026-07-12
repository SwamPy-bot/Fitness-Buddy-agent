/**
 * Groq AI integration module
 * Model: llama-3.3-70b-versatile
 * Handles authentication and chat completion requests
 */
const Groq = require("groq-sdk");

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set in .env");
    }
    client = new Groq({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT = `You are Fitness Buddy, an AI-powered health and fitness coach.
Your persona:
- Friendly, energetic, encouraging — never judgmental
- Use casual, conversational language
- Celebrate small wins with phrases like "You've got this!" and "Small steps, big gains"
- Be empathetic to busy schedules and motivation dips

Your capabilities:
- Recommend home workouts based on fitness level, goals, time, and equipment
- Provide daily motivational tips and habit-building strategies  
- Suggest simple nutritious meals (strong Indian cuisine support: roti, dal, sabzi, idli, dosa, rajma, etc.)
- Track progress and adapt recommendations over time
- Support family fitness plans

Safety rules (NEVER break these):
- NEVER diagnose medical conditions or prescribe treatments
- ALWAYS mention: "I'm a fitness coach, not a doctor. Consult a physician before starting new programs if you have health conditions, injuries, or are pregnant."
- Flag dangerous goals (extreme calorie restriction, overtraining) and redirect
- Never encourage eating disorders, steroid use, or unsafe weight loss

Response format:
1. Acknowledge the user's current state/mood
2. Provide specific, actionable recommendation
3. Brief "Why this works" explanation
4. Motivational closing with optional next step

Keep responses concise, practical, and energetic.`;

async function generateResponse(conversationHistory, userProfile = {}) {
  const groq = getClient();

  let profileContext = "";
  if (userProfile && userProfile.name) {
    profileContext = `\n\nCurrent user profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age || "not specified"}
- Fitness level: ${userProfile.fitnessLevel || "not specified"}
- Goal: ${userProfile.goal || "not specified"}
- Available time: ${userProfile.availableTime || "not specified"} minutes/day
- Equipment: ${userProfile.equipment || "none"}
- Dietary preference: ${userProfile.dietaryPreference || "not specified"}
- Injuries/limitations: ${userProfile.injuries || "none"}`;
  }

  const fullSystemPrompt = SYSTEM_PROMPT + profileContext;

  const messages = [
    { role: "system", content: fullSystemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.9,
    });

    const text = response.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("Empty response from Groq.");
    return text.trim();
  } catch (err) {
    console.error("[Groq error]", err.message);
    return getFallbackResponse(conversationHistory);
  }
}

function getFallbackResponse(history) {
  const last = history[history.length - 1]?.content?.toLowerCase() || "";

  if (last.includes("motivat") || last.includes("tired") || last.includes("lazy") || last.includes("demotivat")) {
    return "Hey, that's totally normal — even elite athletes have off days! The fact that you're here shows you care. Let's do a 10-minute 'feel-good' stretch session or take a 15-minute walk while listening to your favourite music. Movement creates motivation, not the other way around. **Small steps, big gains.** Ready when you are! 🌟";
  }

  if (last.includes("meal") || last.includes("eat") || last.includes("food") || last.includes("diet") || last.includes("nutrition")) {
    return "Great question! Here's a simple, balanced day:\n\n- **Breakfast:** Moong dal cheela with mint chutney — high protein, light on the stomach\n- **Lunch:** Dal + 2 rotis + seasonal sabzi + curd — the classic power combo\n- **Dinner:** Palak paneer (light) + 1 multigrain roti + salad\n- **Snack:** Roasted chana or a banana + 10 almonds\n\nHydration tip: Aim for 2L of water daily, and coconut water is excellent post-workout. **You've got this!** 💪";
  }

  if (last.includes("workout") || last.includes("exercise") || last.includes("minute") || last.includes("train")) {
    return "Let's crush a quick full-body blast! 💥\n\n**Warm-up (5 min):** Jumping jacks, arm circles, high knees\n\n**Main circuit — 3 rounds:**\n- 15 Squats\n- 10 Push-ups (knee-modified if needed)\n- 20 Reverse lunges (10 each leg)\n- 30-sec Plank hold\n\n**Cool-down (5 min):** Quad stretch, child's pose, deep breathing\n\n**Why this works:** Hits all major muscle groups and keeps your heart rate elevated — boosting metabolism for hours after. Rest 60 sec between rounds.\n\n**You've got this!** Want me to set a reminder for tomorrow? 🔥";
  }

  if (last.includes("weight loss") || last.includes("lose weight") || last.includes("fat")) {
    return "Weight loss is a marathon, not a sprint — and that's great news because **consistency beats intensity** every time! 🏃\n\nHere's your starting framework:\n1. **Movement:** 3×/week of 30-min mixed cardio + bodyweight (I'll build the exact plan)\n2. **Nutrition:** Small deficit — reduce portions by ~20%, don't skip meals\n3. **Hydration:** 2–2.5L water daily; cut sugary drinks\n4. **Sleep:** 7–8 hours — poor sleep spikes hunger hormones\n\nSmall steps, big gains. Want me to generate your first week's workout plan? 💪";
  }

  if (last.includes("muscle") || last.includes("strength") || last.includes("bulk")) {
    return "Building muscle is all about **progressive overload** — pushing a little harder each week. Here's the core principle:\n\n- Train each muscle group **2× per week**\n- Aim for **3–4 sets of 8–12 reps** per exercise\n- Eat in a **slight calorie surplus** with high protein (1.6–2g per kg bodyweight)\n- **Rest 48 hours** between working the same muscle group\n\nFor home training, push-up variations, squats, lunges, and resistance bands can take you surprisingly far! Want a full 4-week muscle-gain programme? 💪";
  }

  return "Hi! I'm **Fitness Buddy**, your AI-powered health and fitness coach 🏋️\n\nI'm ready to help you with:\n- **Personalized workouts** for any fitness level\n- **Healthy meal ideas** (Indian cuisine fully supported!)\n- **Daily motivation** when you need a push\n- **Progress tracking** and streak goals\n\nTell me about your fitness goals and we'll build a plan together. What would you like to work on today?";
}

module.exports = { generateResponse };