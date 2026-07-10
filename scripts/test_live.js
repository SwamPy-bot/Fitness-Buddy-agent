/**
 * Live end-to-end test of generateResponse with real credentials
 */
require("dotenv").config();

async function main() {
  const { generateResponse } = require("../server/watsonx");
  const history = [{ role: "user", content: "give me a quick workout plan" }];

  console.log("PROJECT_ID present:", !!process.env.WATSONX_PROJECT_ID);
  console.log("API_KEY present:", !!process.env.WATSONX_API_KEY);

  try {
    const reply = await generateResponse(history, {});
    console.log("SUCCESS — reply length:", reply.length);
    console.log("First 150 chars:", reply.substring(0, 150));
  } catch (e) {
    console.error("THREW (not caught internally):", e.message);
    if (e.result) console.error("result:", JSON.stringify(e.result).substring(0, 300));
  }
}
main();
