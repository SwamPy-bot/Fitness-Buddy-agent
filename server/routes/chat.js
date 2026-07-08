/**
 * Chat route — main conversation endpoint
 * POST /api/chat
 */
const express = require("express");
const router = express.Router();
const { generateResponse } = require("../watsonx");
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const { checkSafety, shouldAddDisclaimer, MEDICAL_DISCLAIMER } = require("../modules/safetyGuard");

/**
 * POST /api/chat
 * Body: { message: string, sessionId: string, profileId?: string }
 */
router.post("/", async (req, res) => {
  const { message, sessionId, profileId } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  const sid = sessionId || uuidv4();

  // Load or create conversation history
  let conv = db.get("conversations").find({ sessionId: sid }).value();
  if (!conv) {
    conv = { sessionId: sid, profileId: profileId || null, messages: [] };
    db.get("conversations").push(conv).write();
  }

  // Append user message
  conv.messages.push({ role: "user", content: message.trim() });

  // Safety boundary check
  const safety = checkSafety(message.trim());
  if (!safety.safe) {
    return res.json({ reply: safety.response, sessionId: sid });
  }

  // Load profile if linked
  let profile = null;
  if (conv.profileId || profileId) {
    profile = db.get("profiles").find({ id: conv.profileId || profileId }).value();
  }

  try {
    let reply = await generateResponse(conv.messages, profile);

    // Append medical disclaimer if relevant
    if (shouldAddDisclaimer(message)) {
      reply += `\n\n> ⚕️ *${MEDICAL_DISCLAIMER}*`;
    }

    // Append assistant reply to history
    conv.messages.push({ role: "assistant", content: reply });

    // Persist updated conversation (keep last 40 messages to cap memory)
    if (conv.messages.length > 40) conv.messages = conv.messages.slice(-40);
    db.get("conversations").find({ sessionId: sid }).assign({ messages: conv.messages, profileId: conv.profileId || profileId || null }).write();

    res.json({ reply, sessionId: sid });
  } catch (err) {
    console.error("[Chat Error]", err.message);
    res.status(500).json({ error: "Couldn't generate a response. Please try again." });
  }
});

/**
 * GET /api/chat/history/:sessionId
 */
router.get("/history/:sessionId", (req, res) => {
  const conv = db.get("conversations").find({ sessionId: req.params.sessionId }).value();
  if (!conv) return res.json({ messages: [] });
  res.json({ messages: conv.messages, profileId: conv.profileId });
});

/**
 * DELETE /api/chat/history/:sessionId
 */
router.delete("/history/:sessionId", (req, res) => {
  db.get("conversations").remove({ sessionId: req.params.sessionId }).write();
  res.json({ success: true });
});

module.exports = router;
