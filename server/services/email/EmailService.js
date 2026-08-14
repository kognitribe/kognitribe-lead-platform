import nodemailer from "nodemailer";
import SuppressionList from "../../models/SuppressionList.js";
import Unsubscribe from "../../models/Unsubscribe.js";
import EmailCampaign from "../../models/EmailCampaign.js";

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

async function blocked(email) {
  if (!validEmail(email)) return "Invalid or missing recipient email";
  const normalized = email.toLowerCase();
  const domain = normalized.split("@")[1];
  const [suppression, unsubscribe] = await Promise.all([
    SuppressionList.findOne({ $or: [{ email: normalized }, { domain }] }),
    Unsubscribe.findOne({ email: normalized })
  ]);
  if (suppression) return "Recipient is on the suppression list";
  if (unsubscribe) return "Recipient has unsubscribed";
  return null;
}

async function limitsReached() {
  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000);
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const hour = await EmailCampaign.countDocuments({ status: "Sent", sentAt: { $gte: hourAgo } });
  const day = await EmailCampaign.countDocuments({ status: "Sent", sentAt: { $gte: dayAgo } });
  if (hour >= Number(process.env.MAX_EMAILS_PER_HOUR || 10)) return "Hourly email limit reached";
  if (day >= Number(process.env.MAX_EMAILS_PER_DAY || 50)) return "Daily email limit reached";
  return null;
}

export async function sendApprovedEmail(campaign, lead) {
  if (campaign.status !== "Approved") throw new Error("Email must be human-approved before sending");
  const block = await blocked(lead.email);
  if (block) throw new Error(block);
  const limit = await limitsReached();
  if (limit) throw new Error(limit);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP is not configured. Add SMTP credentials to server/.env");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: lead.email,
    subject: campaign.subject,
    text: campaign.body
  });

  return { messageId: info.messageId };
}
