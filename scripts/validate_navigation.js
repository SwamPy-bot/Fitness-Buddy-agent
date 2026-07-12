const fs = require("fs");
const html = fs.readFileSync("./public/index.html", "utf8");
let ok = 0; let fail = 0;
function check(label, cond) {
  if (cond) { console.log("  OK  ", label); ok++; }
  else       { console.error("  FAIL", label); fail++; }
}

// page-section divs all present
check("page-chat exists",        html.includes('id="page-chat"'));
check("page-workout exists",     html.includes('id="page-workout"'));
check("page-meal exists",        html.includes('id="page-meal"'));
check("page-motivate exists",    html.includes('id="page-motivate"'));
check("page-family exists",      html.includes('id="page-family"'));
check("page-progress exists",    html.includes('id="page-progress"'));
check("page-add-profile exists", html.includes('id="page-add-profile"'));
check("page-chat starts active", html.includes('id="page-chat" class="page-section active"'));

// CSS classes
check(".page-section CSS",        html.includes(".page-section {"));
check(".page-section.active CSS", html.includes(".page-section.active {"));
check(".quick-btn.active CSS",    html.includes(".quick-btn.active {"));

// Nav buttons wired to showPage()
check("nav-workout wired",     html.includes('id="nav-workout"')    && html.includes("showPage('workout')"));
check("nav-meal wired",        html.includes('id="nav-meal"')       && html.includes("showPage('meal')"));
check("nav-motivate wired",    html.includes('id="nav-motivate"')   && html.includes("showPage('motivate')"));
check("nav-family wired",      html.includes('id="nav-family"')     && html.includes("showPage('family')"));
check("nav-progress wired",    html.includes('id="nav-progress"')   && html.includes("showPage('progress')"));
check("nav-add-profile wired", html.includes('id="nav-add-profile"')&& html.includes("showPage('add-profile')"));

// JS functions defined
check("showPage() defined",            html.includes("function showPage("));
check("chatAndGo() defined",           html.includes("function chatAndGo("));
check("saveProfileFromPage() defined", html.includes("function saveProfileFromPage("));
check("logWorkoutFromPage() defined",  html.includes("function logWorkoutFromPage("));
check("refreshProgressPage() defined", html.includes("function refreshProgressPage("));
check("PAGE_TITLES map",               html.includes("PAGE_TITLES"));
check("init calls showPage(chat)",     html.includes("showPage('chat')"));
check("newChat calls showPage",        html.includes("function newChat") && html.includes("showPage('chat')"));

// Inline profile form (pp prefix distinct from modal p prefix)
check("ppName field",  html.includes('id="ppName"'));
check("ppLevel field", html.includes('id="ppLevel"'));
check("ppGoal field",  html.includes('id="ppGoal"'));

// Inline progress container
check("progressPageContent div", html.includes('id="progressPageContent"'));

console.log("\nResults:", ok, "OK,", fail, "FAIL");
if (fail > 0) process.exit(1);
