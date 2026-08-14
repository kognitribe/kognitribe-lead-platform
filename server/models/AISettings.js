import mongoose from "mongoose";
const schema = new mongoose.Schema({
  provider: { type: String, default: "openai-compatible" },
  model: { type: String, default: "gpt-4o-mini" },
  apiKey: String,
  baseUrl: { type: String, default: "https://api.openai.com/v1" },
  temperature: { type: Number, default: 0.4 },
  systemPrompt: String,
  enabled: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("AISettings", schema);
