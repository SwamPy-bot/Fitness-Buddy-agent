/**
 * IBM Watsonx.ai integration module
 * Model: meta-llama/llama-3-3-70b-instruct
 * Handles authentication and text generation requests
 */
const { WatsonXAI } = require("@ibm-cloud/watsonx-ai");
const { IamAuthenticator } = require("ibm-cloud-sdk-core");

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.WATSONX_API_KEY || process.env.WATSONX_APIKEY;
    if (!apiKey) {
      throw new Error("WATSONX_API_KEY is not set in .env");
    }
    // IMPORTANT: WatsonXAI.newInstance() auto-detects auth from the env var
    // named "WATSONX_APIKEY" (no underscore). Our .env uses WATSONX_API_KEY
    // (with underscore). We must pass the authenticator explicitly so the SDK
    // never tries — and fails — to build one from the environment.
    client = WatsonXAI.newInstance({
      version: "2024-05-31",
      serviceUrl: process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com",
      authenticator: new IamAuthenticator({ apikey: apiKey }),
    });
  }
  return client;
}

const SYSTEM_PROMPT = `You are Fitness Buddy, an AI-powered health and fitness coach built on IBM Watsonx.ai.
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

/**
 * Generate a chat response from Llama 3.3 70B Instruct via Watsonx.ai
 * @param {Array} conversationHistory - [{role, content}, ...]
 * @param {Object} userProfile - current user's profile data
 * @returns {Promise<string>}
 */
async function generateResponse(conversationHistory, userProfile = {}) {
  // Default to Llama 3.3 70B Instruct
  const modelId = process.env.GRANITE_MODEL_ID || "meta-llama/llama-3-3-70b-instruct";
  const projectId = process.env.WATSONX_PROJECT_ID;

  // Return fallback immediately when credentials are missing
  if (!projectId) {
    return getFallbackResponse(conversationHistory);
  }

  const wx = getClient();

  // Build profile context if available
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

  // The Watsonx textChat API does NOT accept a top-level "system" parameter.
  // The system prompt must be the first message with role "system" in the array.
  const messages = [
    { role: "system", content: fullSystemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  try {
    // Llama 3.3 70B Instruct optimal parameters:
    //   temperature 0.7  — balanced creativity without rambling
    //   topP        0.9  — nucleus sampling keeps output focused
    //   maxTokens   800  — enough for a full workout plan
    const response = await wx.textChat({
      modelId,
      projectId,
      messages,
      maxTokens: 800,
      temperature: 0.7,
      topP: 0.9,
    });

    const text =
      response?.result?.choices?.[0]?.message?.content ||
      response?.result?.results?.[0]?.generated_text ||
      "";

    if (!text) throw new Error("Empty response from model.");
    return text.trim();
  } catch (err) {
    // Catch all auth / credential / config errors → return fallback instead of crashing
    const msg = (err.message || "").toLowerCase();
    const isAuthError =
      msg.includes("project_id") ||
      msg.includes("api key") ||
      msg.includes("api_key") ||
      msg.includes("apikey") ||
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("unauthorized") ||
      msg.includes("not authenticated") ||
      msg.includes("invalid credentials") ||
      msg.includes("could not be found") ||     // IBM IAM: "API key could not be found"
      msg.includes("bxnim") ||                  // IBM IAM error codes e.g. BXNIM0415E
      msg.includes("serviceurl") ||
      msg.includes("access is denied") ||
      (err.status && (err.status === 401 || err.status === 403));
    if (isAuthError) {
      return getFallbackResponse(conversationHistory);
    }
    throw err;
  }
}

/**
 * Demo fallback when Watsonx credentials are not configured.
 * Provides realistic responses so the UI is fully testable without an API key.
 */
function getFallbackResponse(history) {
  const last = history[history.length - 1]?.content?.toLowerCase() || "";

  if (last.includes("motivat") || last.includes("tired") || last.includes("lazy") || last.includes("demotivat")) {
    return "Hey, that's totally normal — even elite athletes have off days! The fact that you're here shows you care. Let's do a 10-minute 'feel-good' stretch session or take a 15-minute walk while listening to your favourite music. Movement creates motivation, not the other way around. **Small steps, big gains.** Ready when you are! 🌟\n\n*(Note: Add your IBM Watsonx.ai credentials in .env to enable full Llama 3.3 70B AI responses.)*";
  }

  if (last.includes("meal") || last.includes("eat") || last.includes("food") || last.includes("diet") || last.includes("nutrition")) {
    return "Great question! Here's a simple, balanced day:\n\n- **Breakfast:** Moong dal cheela with mint chutney — high protein, light on the stomach\n- **Lunch:** Dal + 2 rotis + seasonal sabzi + curd — the classic power combo\n- **Dinner:** Palak paneer (light) + 1 multigrain roti + salad\n- **Snack:** Roasted chana or a banana + 10 almonds\n\nHydration tip: Aim for 2L of water daily, and coconut water is excellent post-workout. **You've got this!** 💪\n\n*(Note: Add your IBM Watsonx.ai credentials in .env to enable full Llama 3.3 70B AI responses.)*";
  }

  if (last.includes("workout") || last.includes("exercise") || last.includes("minute") || last.includes("train")) {
    return "Let's crush a quick full-body blast! 💥\n\n**Warm-up (5 min):** Jumping jacks, arm circles, high knees\n\n**Main circuit — 3 rounds:**\n- 15 Squats\n- 10 Push-ups (knee-modified if needed)\n- 20 Reverse lunges (10 each leg)\n- 30-sec Plank hold\n\n**Cool-down (5 min):** Quad stretch, child's pose, deep breathing\n\n**Why this works:** Hits all major muscle groups and keeps your heart rate elevated — boosting metabolism for hours after. Rest 60 sec between rounds.\n\n**You've got this!** Want me to set a reminder for tomorrow? 🔥\n\n*(Note: Add your IBM Watsonx.ai credentials in .env to enable full Llama 3.3 70B AI responses.)*";
  }

  if (last.includes("weight loss") || last.includes("lose weight") || last.includes("fat")) {
    return "Weight loss is a marathon, not a sprint — and that's great news because **consistency beats intensity** every time! 🏃\n\nHere's your starting framework:\n1. **Movement:** 3×/week of 30-min mixed cardio + bodyweight (I'll build the exact plan)\n2. **Nutrition:** Small deficit — reduce portions by ~20%, don't skip meals\n3. **Hydration:** 2–2.5L water daily; cut sugary drinks\n4. **Sleep:** 7–8 hours — poor sleep spikes hunger hormones\n\nSmall steps, big gains. Want me to generate your first week's workout plan? 💪\n\n*(Note: Add your IBM Watsonx.ai credentials in .env to enable full Llama 3.3 70B AI responses.)*";
  }

  if (last.includes("muscle") || last.includes("strength") || last.includes("bulk")) {
    return "Building muscle is all about **progressive overload** — pushing a little harder each week. Here's the core principle:\n\n- Train each muscle group **2× per week**\n- Aim for **3–4 sets of 8–12 reps** per exercise\n- Eat in a **slight calorie surplus** with high protein (1.6–2g per kg bodyweight)\n- **Rest 48 hours** between working the same muscle group\n\nFor home training, push-up variations, squats, lunges, and resistance bands can take you surprisingly far! Want a full 4-week muscle-gain programme? 💪\n\n*(Note: Add your IBM Watsonx.ai credentials in .env to enable full Llama 3.3 70B AI responses.)*";
  }

  return "Hi! I'm **Fitness Buddy**, your AI-powered health and fitness coach 🏋️\n\nI'm ready to help you with:\n- **Personalized workouts** for any fitness level\n- **Healthy meal ideas** (Indian cuisine fully supported!)\n- **Daily motivation** when you need a push\n- **Progress tracking** and streak goals\n\nTell me about your fitness goals and we'll build a plan together. What would you like to work on today?\n\n*(Note: Add your IBM Watsonx.ai credentials in .env to enable full Llama 3.3 70B AI responses.)*";
}

module.exports = { generateResponse };
