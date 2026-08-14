import mongoose from "mongoose";
const schema = new mongoose.Schema({
  companyName: { type: String, default: "Kognitribe Global Solutions" },
  description: { type: String, default: "Technology solutions for modern businesses." },
  services: [{
    title: String,
    description: String,
    technologies: [String]
  }],
  website: String,
  contactEmail: String,
  emailSignature: String
}, { timestamps: true });
export default mongoose.model("CompanySettings", schema);
