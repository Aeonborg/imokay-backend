const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage (later you can replace with Supabase)
let users = {};
let checkins = {};

// Register user
app.post("/setup", (req, res) => {
  const { name, email, contactEmail, intervalHours } = req.body;
  const userId = Date.now().toString();
  users[userId] = { name, email, contactEmail, intervalHours };
  checkins[userId] = Date.now();
  res.json({ userId });
});

// User check-in
app.post("/checkin", (req, res) => {
  const { userId } = req.body;
  if (!users[userId]) {
    return res.status(404).json({ error: "User not found" });
  }
  checkins[userId] = Date.now();
  res.json({ status: "okay" });
});

// Get status
app.get("/status/:userId", (req, res) => {
  const { userId } = req.params;
  if (!users[userId]) {
    return res.status(404).json({ error: "User not found" });
  }
  const last = checkins[userId];
  const interval = users[userId].intervalHours * 60 * 60 * 1000;
  const status = Date.now() - last > interval ? "missed" : "okay";
  res.json({ status });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
