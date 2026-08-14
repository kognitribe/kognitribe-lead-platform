import mongoose from "mongoose";
const schema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true },
  domain: { type: String, lowercase: true, trim: true },
  reason: String,
  source: String
}, { timestamps: true });
schema.index({ email: 1 });
schema.index({ domain: 1 });
export default mongoose.model("SuppressionList", schema);
