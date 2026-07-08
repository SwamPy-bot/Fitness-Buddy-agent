/**
 * Lightweight JSON-file database using lowdb
 * Stores user profiles, conversation history, and progress logs
 */
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const fs = require("fs");

// Ensure data directory exists
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const adapter = new FileSync(path.join(dataDir, "db.json"));
const db = low(adapter);

// Set default schema
db.defaults({
  profiles: [],
  conversations: [],
  progress: [],
}).write();

module.exports = db;
