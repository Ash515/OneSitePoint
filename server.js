const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 4000; // Match this with frontend requests
const DB_PATH = path.join(__dirname, "db.json");

app.use(cors()); // Allow frontend to access API
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB if not present
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ sites: [], activeSite: "", iframeURLs: {} }, null, 2));
  }
  const raw = fs.readFileSync(DB_PATH);
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Get all data
app.get("/sites", (req, res) => {
  const db = readDB();
  res.json(db);
});

// Add a site
app.post("/sites", (req, res) => {
  const { site } = req.body;
  const db = readDB();

  if (!db.sites.includes(site)) {
    db.sites.push(site);
  }
  db.activeSite = site;
  writeDB(db);
  res.json({ success: true });
});

// Set active site
app.post("/active-site", (req, res) => {
  const { site } = req.body;
  const db = readDB();
  db.activeSite = site;
  writeDB(db);
  res.json({ success: true });
});

// Save iframe's internal URL for a given site
app.post("/iframe-url", (req, res) => {
  const { site, url } = req.body;
  const db = readDB();
  db.iframeURLs[site] = url;
  writeDB(db);
  res.json({ success: true });
});

app.delete("/sites", (req, res) => {
  const { site } = req.body;
  const db = readDB();

  // Remove the site from the list
  db.sites = db.sites.filter((s) => s.url !== site);

  // Remove any iframe URL related to this site
  delete db.iframeURLs[site];

  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});



