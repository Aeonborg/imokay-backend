import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Find or create user by email
app.post("/findOrCreate", async (req, res) => {
  const { email, name, contactEmail, intervalHours, message } = req.body;

  // Try to find existing user
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existing) {
    return res.json({ userId: existing.id, user: existing });
  }

  // If not found → require other fields to create
  if (!name || !contactEmail || !intervalHours) {
    return res.status(400).json({ error: "Missing fields to create new user" });
  }

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name,
        email,
        contactEmail,
        intervalHours,
        message: message || `Please check on ${name}.`,
        lastCheckin: new Date()
      }
    ])
    .select();

  if (error) return res.status(400).json({ error });
  res.json({ userId: data[0].id, user: data[0] });
});

// Check-in
app.post("/checkin", async (req, res) => {
  const { userId } = req.body;
  const { error } = await supabase
    .from("users")
    .update({ lastCheckin: new Date() })
    .eq("id", userId);

  if (error) return res.status(400).json({ error });
  res.json({ status: "okay" });
});

// Status
app.get("/status/:userId", async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return res.status(404).json({ error: "User not found" });

  const diffHours = (Date.now() - new Date(data.lastCheckin)) / (1000 * 60 * 60);
  const status = diffHours > data.intervalHours ? "missed" : "okay";

  res.json({ status, message: data.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
