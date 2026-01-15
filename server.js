const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let users = {};
let checkins = {};

// Register user
app.post("/setup", (req, res) => {
  const { name, email, contactEmail, intervalHours, message } = req.body;
  const userId = Date.now().toString();
  users[userId] = {
    name,
    email,
    contactEmail,
    intervalHours,
    message: message || `Please check on ${name}.` // default if none provided
  };
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
  const message = users[userId].message;
  res.json({ status, message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
