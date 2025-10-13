import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend")));

mongoose.connect("mongodb://127.0.0.1:27017/campaignDB")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const campaignSchema = new mongoose.Schema({
  campaignName: String,
  clientName: String,
  startDate: String,
  status: { type: String, enum: ["Active", "Paused", "Completed"], default: "Active" }
});
const Campaign = mongoose.model("Campaign", campaignSchema);

app.post("/campaigns", async (req, res) => {
  const campaign = new Campaign(req.body);
  await campaign.save();
  res.status(201).json(campaign);
});

app.get("/campaigns", async (req, res) => {
  const campaigns = await Campaign.find();
  res.json(campaigns);
});

app.put("/campaigns/:id", async (req, res) => {
  const updated = await Campaign.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(updated);
});

app.delete("/campaigns/:id", async (req, res) => {
  await Campaign.findByIdAndDelete(req.params.id);
  res.json({ message: "Campaign deleted" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
