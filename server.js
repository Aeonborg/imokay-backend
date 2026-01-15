// server.js
import express from "express"
import cors from "cors"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Find or create user
app.post("/findOrCreate", async (req, res) => {
  const { email, name, contactPerson, contactEmail, message, intervalHours } = req.body

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single()

  if (existing) return res.json({ userId: existing.id, user: existing })

  if (!name || !contactPerson || !contactEmail || !intervalHours) {
    return res.status(400).json({ error: "Missing fields to create new user" })
  }

  const { data, error } = await supabase
    .from("users")
    .insert([{
      name,
      email,
      contactperson: contactPerson,
      contactemail: contactEmail,
      message: message || "Please Contact User",
      intervalhours: intervalHours,
      lastcheckin: new Date()
    }])
    .select()

  if (error) return res.status(400).json({ error: error.message })
  res.json({ userId: data[0].id, user: data[0] })
})

// Check-in
app.post("/checkin", async (req, res) => {
  const { userId } = req.body
  const { error } = await supabase
    .from("users")
    .update({ lastcheckin: new Date() })
    .eq("id", userId)

  if (error) return res.status(400).json({ error: error.message })
  res.json({ status: "okay" })
})

// Update interval
app.post("/updateInterval", async (req, res) => {
  const { userId, intervalHours } = req.body
  const { error } = await supabase
    .from("users")
    .update({ intervalhours: intervalHours })
    .eq("id", userId)

  if (error) return res.status(400).
