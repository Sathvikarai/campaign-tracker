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
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", userSchema);

const campaignSchema = new mongoose.Schema({
  campaignName: String,
  clientName: String,
  startDate: String,
  status: { type: String, enum: ["Active", "Paused", "Completed"], default: "Active" }
});

const Campaign = mongoose.model("Campaign", campaignSchema);
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ message: "Username exists" });
  await new User({ username, password }).save();
  res.json({ message: "User registered" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  res.json({ message: "Login successful" });
});

app.post("/campaigns", async (req, res) => {
  const campaign = new Campaign(req.body);
  await campaign.save();
  res.json(campaign);
});

app.get("/campaigns", async (_, res) => res.json(await Campaign.find()));

app.put("/campaigns/:id", async (req, res) =>
  res.json(await Campaign.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }))
);

app.delete("/campaigns/:id", async (req, res) => {
  await Campaign.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.get("/", (_, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));

app.listen(5000, () => console.log("http://localhost:5000"));
