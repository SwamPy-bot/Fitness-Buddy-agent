/**
 * Setup script — copy .env.example to .env if it doesn't exist
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env");
const examplePath = path.join(__dirname, "../.env.example");

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(examplePath, envPath);
  console.log("✅  Created .env from .env.example");
  console.log("📝  Edit .env with your IBM Watsonx.ai credentials to enable AI responses.");
} else {
  console.log("ℹ️   .env already exists. No changes made.");
}
console.log("\n🚀  Run: npm install && npm start");
