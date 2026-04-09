const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Path to feature data
const DATA_FILE = path.join(__dirname, "data.json");

// GitHub API (CASE-SENSITIVE PATH)
const GITHUB_API = "https://api.github.com/repos/paulaaditya/multivsm/contents";

/**
 * GET /api/images
 * Fetch images from GitHub + attach features
 */
app.get("/api/images", async (req, res) => {
  try {
    const response = await axios.get(GITHUB_API, {
      headers: { "User-Agent": "node.js" }
    });

    const data = fs.existsSync(DATA_FILE)
      ? JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
      : {};

    const images = response.data
  .filter(file => /\.(jpg|jpeg|png)$/i.test(file.name))
  .map(file => ({
    name: file.name.replace(/\.[^/.]+$/, ""),  // ← add this, strips extension
    src: file.download_url,
    features: data[file.name] || { energy: 2, creativity: 2, power: 2 }
  }));

    res.json(images);
  } catch (err) {
    console.error("GitHub fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch images", details: err.message });
  }
});

/**
 * POST /api/update
 * Update feature data
 */
app.post("/api/update", (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ status: "updated" });
  } catch (err) {
    console.error("Write error:", err.message);
    res.status(500).json({ error: "Failed to update data" });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});