import SuppressionList from "../models/SuppressionList.js";
import Unsubscribe from "../models/Unsubscribe.js";

export async function addSuppression(data) {
  const email = data.email?.toLowerCase().trim();
  const domain = data.domain?.toLowerCase().trim();
  return SuppressionList.create({ email, domain, reason: data.reason, source: data.source });
}

export async function addUnsubscribe(email, leadId, reason = "Recipient opted out") {
  const record = await Unsubscribe.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { email: email.toLowerCase().trim(), leadId, reason },
    { upsert: true, new: true }
  );
  await SuppressionList.findOneAndUpdate(
    { email: record.email },
    { email: record.email, reason, source: "unsubscribe" },
    { upsert: true, new: true }
  );
  return record;
}
