/**
 * IBM Watsonx.ai Granite integration module
 * Handles authentication and text generation requests
 */
const { WatsonXAI } = require("@ibm-cloud/watsonx-ai");

let client = null;

function getClient() {
  if (!client) {
    client = WatsonXAI.newInstance({
      version: "2024-05-31",
      serviceUrl: process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com",
    });
  }
  return client;
}

const SYSTEM_PROMPT = `You are Fitness Buddy, an AI-powered health and fitness coach built on IBM Watsonx.ai Granite.
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
 * Generate a chat response from Granite
 * @param {Array} conversationHistory - [{role, content}, ...]
 * @param {Object} userProfile - current user's profile data
 * @returns {Promise<string>}
 */
async function generateResponse(conversationHistory, userProfile = {}) {
  const modelId = process.env.GRANITE_MODEL_ID || "ibm/granite-13b-chat-v2";
  const projectId = process.env.WATSONX_PROJECT_ID;

  // BUG FIX: return fallback immediately instead of throwing — the catch below
  // would never match "PROJECT_ID" because the error message contains "WATSONX_PROJECT_ID"
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

  // Format conversation for Granite
  const fullSystemPrompt = SYSTEM_PROMPT + profileContext;

  // Build the prompt in Granite chat format
  const messages = conversationHistory.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  try {
    // BUG FIX: textChat uses maxTokens not max_new_tokens; temperature/topP are
    // top-level params not nested under "parameters" for the chat endpoint
    const response = await wx.textChat({
      modelId,
      projectId,
      messages,
      system: fullSystemPrompt,
      maxTokens: 600,
      temperature: 0.75,
      topP: 0.9,
      repetitionPenalty: 1.1,
    });

    const text =
      response?.result?.choices?.[0]?.message?.content ||
      response?.result?.results?.[0]?.generated_text ||
      "";

    if (!text) throw new Error("Empty response from Granite model.");
    return text.trim();
  } catch (err) {
    // BUG FIX: broaden the catch to cover more auth/config error messages
    const msg = err.message || "";
    if (
      msg.includes("PROJECT_ID") ||
      msg.includes("API key") ||
      msg.includes("api_key") ||
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("Unauthorized") ||
      msg.includes("not authenticated") ||
      msg.includes("serviceUrl") ||
      (err.status && (err.status === 401 || err.status === 403))
    ) {
      return getFallbackResponse(conversationHistory);
    }
    throw err;
  }
}

/**
 * Demo fallback when Watsonx credentials aren't configured
 */
function getFallbackResponse(history) {
  const last = history[history.length - 1]?.content?.toLowerCase() || "";
  if (last.includes("motivat") || last.includes("tired") || last.includes("lazy")) {
    return "Hey, that's totally normal — even athletes have off days! The fact that you're here shows you care. Let's do a 10-minute 'feel-good' stretch session or take a 15-minute walk while listening to your favourite music. Movement creates motivation, not the other way around. Small steps, big gains. Ready when you are! 🌟\n\n*(Note: Connect your IBM Watsonx.ai credentials in .env to enable full AI responses.)*";
  }
  if (last.includes("workout") || last.includes("exercise") || last.includes("minute")) {
    return "Perfect! Let's crush a quick full-body blast. 5 min warm-up (jumping jacks, arm circles), then 3 rounds of: 15 squats, 10 push-ups (knee-modified if needed), 20 lunges, 30-second plank. Cool down with stretches. This hits all major muscle groups and boosts metabolism for hours. You've got this! 💪\n\n*(Note: Connect your IBM Watsonx.ai credentials in .env to enable full AI responses.)*";
  }
  return "Hi! I'm Fitness Buddy, your AI fitness coach 🏋️. I'm ready to help you with personalized workouts, nutrition tips, and daily motivation! Tell me about your fitness goals and we'll build a plan together.\n\n*(Note: Connect your IBM Watsonx.ai credentials in .env to enable full AI-powered responses.)*";
}

module.exports = { generateResponse };
