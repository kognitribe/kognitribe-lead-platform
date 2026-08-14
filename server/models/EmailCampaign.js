import mongoose from "mongoose";

const schema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: String,
  body: String,
  status: { type: String, enum: ["Draft", "Ready for Review", "Approved", "Sent", "Failed", "Rejected"], default: "Draft" },
  generatedBy: { type: String, default: "AI" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: Date,
  sentAt: Date,
  openedAt: Date,
  repliedAt: Date,
  sendResult: String,
  isDemo: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("EmailCampaign", schema);
