/**
 * Safety & boundary checks module
 * Screens user messages for dangerous topics before sending to the LLM
 */

const DANGEROUS_PATTERNS = [
  {
    regex: /(\d+)\s*(calorie|kcal|cal)/i,
    check: (match) => {
      const cals = parseInt(match[1]);
      return cals < 900;
    },
    message: "⚠️ Heads up: Consuming fewer than 900 calories per day is medically dangerous and can cause serious harm. I can help you lose weight safely — most women need at least 1200 kcal/day and men at least 1500 kcal/day. Let's build a sustainable plan instead! 💪",
  },
  {
    regex: /steroid|hgh|growth hormone|doping|ped\b/i,
    message: "🚫 I'm not able to advise on performance-enhancing drugs or steroids — they carry serious health risks and are banned in most sports. Let's focus on natural training and nutrition that delivers real, lasting results! You've got this the right way. 💪",
  },
  {
    regex: /laxative|purge|vomit|binge.*(eat|food)|eat.*(disorder)|anorex|bulimi/i,
    message: "💙 I'm noticing this might relate to disordered eating. I care about your wellbeing. Please reach out to a healthcare professional or eating disorder helpline (India: iCall — 9152987821). You deserve proper support, not fitness tips.",
  },
  {
    regex: /crash diet|starvation|fasting.*(\d+)\s*day/i,
    check: (match) => {
      if (match[2]) return parseInt(match[2]) > 3;
      return true;
    },
    message: "⚠️ Crash diets and extended starvation harm your metabolism, muscle mass, and mental health. I'd love to help you reach your goals sustainably — small consistent changes beat extreme diets every time. Small steps, big gains! 🌱",
  },
  {
    regex: /suicide|kill myself|self.harm|hurt myself/i,
    message: "💙 It sounds like you might be going through a really tough time. Please reach out to iCall (India): 9152987821 or Vandrevala Foundation: 1860-2662-345, available 24/7. You matter, and help is available right now.",
  },
];

const MEDICAL_DISCLAIMER =
  "I'm a fitness coach, not a doctor. Please consult a physician before starting new exercise programs, especially if you have health conditions, injuries, or are pregnant.";

/**
 * Check if a message triggers a safety boundary
 * @param {string} message
 * @returns {{ safe: boolean, response?: string }}
 */
function checkSafety(message) {
  for (const pattern of DANGEROUS_PATTERNS) {
    const match = message.match(pattern.regex);
    if (match) {
      if (!pattern.check || pattern.check(match)) {
        return { safe: false, response: pattern.message };
      }
    }
  }
  return { safe: true };
}

/**
 * Determine if a disclaimer should be appended to a response
 * @param {string} message - user's message
 * @returns {boolean}
 */
function shouldAddDisclaimer(message) {
  const medicalKeywords = /injur|pain|condition|disease|pregnan|heart|diabetes|hypertension|arthritis|surgery|doctor|physician|medication|prescription/i;
  return medicalKeywords.test(message);
}

module.exports = { checkSafety, shouldAddDisclaimer, MEDICAL_DISCLAIMER };
