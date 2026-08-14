import mongoose from "mongoose";
const schema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, unique: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  reason: String
}, { timestamps: true });
export default mongoose.model("Unsubscribe", schema);
