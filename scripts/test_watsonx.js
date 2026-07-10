/**
 * Quick smoke test for watsonx.js fallback paths
 * Run: node scripts/test_watsonx.js
 */
require("dotenv").config();
let pass = 0; let fail = 0;

async function test(label, fn) {
  try { await fn(); console.log("  PASS", label); pass++; }
  catch(e) { console.error("  FAIL", label, "->", e.message); fail++; }
}

async function runTests() {
  // Helper: load a fresh (uncached) copy of watsonx.js
  function freshWatsonx() {
    Object.keys(require.cache).forEach(k => { if (k.includes("watsonx")) delete require.cache[k]; });
    return require("../server/watsonx");
  }

  // Test 1: no projectId → instant fallback (no network call)
  await test("fallback when WATSONX_PROJECT_ID missing", async () => {
    const orig = process.env.WATSONX_PROJECT_ID;
    delete process.env.WATSONX_PROJECT_ID;
    const { generateResponse } = freshWatsonx();
    const r = await generateResponse([{ role: "user", content: "workout" }], {});
    if (orig) process.env.WATSONX_PROJECT_ID = orig;
    if (!r.includes("Warm-up")) throw new Error("expected workout fallback, got: " + r.substring(0, 80));
  });

  // Test 2: all 6 fallback keyword branches
  const branches = [
    ["motivate me",   "Small steps"],
    ["meal plan",     "Breakfast"],
    ["workout plan",  "Warm-up"],
    ["lose weight",   "consistency"],
    ["build muscle",  "progressive overload"],
    ["hello there",   "Fitness Buddy"],
  ];
  for (const [kw, expected] of branches) {
    await test("fallback branch: " + kw, async () => {
      const orig = process.env.WATSONX_PROJECT_ID;
      delete process.env.WATSONX_PROJECT_ID;
      const { generateResponse } = freshWatsonx();
      const r = await generateResponse([{ role: "user", content: kw }], {});
      if (orig) process.env.WATSONX_PROJECT_ID = orig;
      if (!r.includes(expected)) {
        throw new Error("expected '" + expected + "', got: " + r.substring(0, 100));
      }
    });
  }

  // Test 3: syntax check
  const { execSync } = require("child_process");
  test("syntax: server/watsonx.js", () => execSync("node --check server/watsonx.js"));

  // Test 4: system prompt is in messages array, not top-level param
  test("system prompt in messages array", () => {
    const src = require("fs").readFileSync("server/watsonx.js", "utf8");
    if (src.includes('"system": fullSystemPrompt') || src.includes("system: fullSystemPrompt")) {
      throw new Error("system prompt is still a top-level textChat param — must be in messages array");
    }
    if (!src.includes('role: "system"')) {
      throw new Error("system role not found in messages array");
    }
  });

  // Test 5: IamAuthenticator is explicitly passed
  test("IamAuthenticator explicitly passed to newInstance", () => {
    const src = require("fs").readFileSync("server/watsonx.js", "utf8");
    if (!src.includes("IamAuthenticator")) throw new Error("IamAuthenticator not imported");
    if (!src.includes("authenticator: new IamAuthenticator")) throw new Error("authenticator not passed");
  });

  console.log("\nResults:", pass, "passed,", fail, "failed");
  if (fail > 0) process.exit(1);
}

runTests();
