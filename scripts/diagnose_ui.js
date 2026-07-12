/**
 * Diagnose UI onclick + watsonx issues
 */
const fs = require("fs");
const html = fs.readFileSync("./public/index.html", "utf8");
const indexJs = fs.readFileSync("./server/index.js", "utf8");
const watsonxJs = fs.readFileSync("./server/watsonx.js", "utf8");

let pass = 0; let warn = 0;
function check(label, condition, note) {
  if (condition) { console.log("  OK  ", label); pass++; }
  else           { console.warn("  WARN", label, note || ""); warn++; }
}

// ── Server port ──────────────────────────────────────────────────
const portMatch = indexJs.match(/PORT \|\| (\d+)/);
const port = portMatch ? portMatch[1] : "?";
console.log("\n=== Server ===");
check("server port", !!portMatch, "could not detect port");
console.log("  Port:", port, "(open http://localhost:" + port + " in browser)");

// ── Watsonx ───────────────────────────────────────────────────────
console.log("\n=== Watsonx ===");
check("IamAuthenticator imported", watsonxJs.includes("IamAuthenticator"));
check("authenticator passed explicitly", watsonxJs.includes("authenticator: new IamAuthenticator"));
check("system prompt in messages array", watsonxJs.includes('role: "system"'));
check("no top-level system param", !watsonxJs.includes("system: fullSystemPrompt"));
check("BXNIM caught by error handler", watsonxJs.includes("bxnim"));
check("fallback: no projectId returns immediately", watsonxJs.includes("return getFallbackResponse"));

// ── Frontend onclick handlers ─────────────────────────────────────
console.log("\n=== Frontend onclick handlers ===");
check("newChat button", html.includes('onclick="newChat()"'));
check("openProfileModal button", html.includes('onclick="openProfileModal()"'));
check("Generate Workout quickAction", html.includes("Generate a workout for me right now!"));
check("Meal Plan quickAction", html.includes("Suggest a healthy meal plan for today."));
check("Motivate Me quickAction", html.includes("Give me a motivational message"));
check("Family Workout quickAction", html.includes("Create a family workout"));
check("My Progress openProgressModal", html.includes('onclick="openProgressModal()"'));

// ── Functions defined ─────────────────────────────────────────────
console.log("\n=== JS functions defined ===");
check("quickAction()", html.includes("function quickAction("));
check("newChat()", html.includes("function newChat("));
check("openProfileModal()", html.includes("function openProfileModal("));
check("openProgressModal()", html.includes("function openProgressModal("));
check("sendMessage()", html.includes("function sendMessage("));
check("saveProfile()", html.includes("function saveProfile("));

// ── Z-index stacking ──────────────────────────────────────────────
console.log("\n=== Z-index & pointer events ===");
check("sidebar has z-index", html.includes("z-index: 100"));
check("modal overlay z-index 999", html.includes("z-index: 999"));
check("closed modal has pointer-events:none", html.includes("pointer-events: none"));

// Key finding: are modals OUTSIDE .app div?
const appDiv = html.indexOf('<div class="app">');
const profileModalDiv = html.indexOf('id="profileModal"');
const modalAfterApp = profileModalDiv > html.indexOf('</div>\n\n<!-- ── Add Profile Modal');
check("modals rendered outside .app wrapper (correct)", profileModalDiv > appDiv);

// ── sendBtn guard ─────────────────────────────────────────────────
console.log("\n=== Send button guard ===");
check("sendBtn disabled while loading", html.includes("sendBtn').disabled = true"));
check("sendBtn re-enabled in finally", html.includes("finally") && html.includes("sendBtn').disabled = false"));

console.log("\n=== Summary: " + pass + " OK, " + warn + " warnings ===\n");
