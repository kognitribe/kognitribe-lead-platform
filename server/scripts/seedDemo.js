import "dotenv/config";
import { connectDB } from "../config/db.js";
import Lead from "../models/Lead.js";
import LeadSource from "../models/LeadSource.js";
import EmailCampaign from "../models/EmailCampaign.js";
import CompanySettings from "../models/CompanySettings.js";
import AISettings from "../models/AISettings.js";
import User from "../models/User.js";

await connectDB();
const admin=await User.findOne({role:"admin"});
const services=["Web Development","Cloud Solutions","Data Engineering","AI & Machine Learning","3D Design","Frontend Development","Backend Development"];
const titles=[
 "Need React and Node.js team for MVP","Looking for AWS migration help","Building ETL pipeline for analytics",
 "Need AI chatbot for customer support","Need modern marketing website","Looking for backend API developer",
 "3D product visualization project","Frontend redesign for SaaS product","Need full-stack development partner","Cloud deployment and optimization"
];
const sources=["Reddit","RSS","GitHub","Opportunity API"];
for(let i=0;i<30;i++){
 const score=25+(i*7)%75;
 const matched=[services[i%services.length],services[(i+2)%services.length]];
 const lead=await Lead.create({
  source:sources[i%sources.length],sourceId:`demo-${i+1}`,sourceUrl:`https://example.com/demo/${i+1}`,
  name:["Aarav","Priya","Daniel","Sofia","Michael"][i%5],company:`Demo Company ${i+1}`,
  email:i%4===0?null:`demo${i+1}@example.com`,location:"Remote",title:titles[i%titles.length],
  description:`Demo public opportunity: ${titles[i%titles.length]}. This record is for UI and analytics testing.`,
  originalContent:`[DEMO DATA] ${titles[i%titles.length]}. Public requirement example.`,
  matchedServices:matched,leadScore:score,
  intent:score>=75?"High Intent":score>=50?"Medium Intent":"Low Intent",
  aiSummary:"Demo lead showing a relevant technology requirement.",
  aiReason:"Demo analysis generated for testing.",
  status:score>=50?"Qualified":"New",contactStatus:i%4===0?"No Public Email":"Public Email",isDemo:true,
  publishedAt:new Date(Date.now()-i*864e5)
 });
 if(admin && lead.email && i<12) await EmailCampaign.create({
   leadId:lead._id,userId:admin._id,subject:`Regarding your ${lead.title}`,
   body:`Hi ${lead.name},\n\nI came across your public post regarding ${lead.title}.\n\nKognitribe Global Solutions may be able to help with ${matched.join(", ")}.\n\nRegards,\nKognitribe Global Solutions`,
   status:["Ready for Review","Approved","Sent","Rejected"][i%4],approvedBy:i%4===1||i%4===2?admin._id:undefined,approvedAt:i%4===1||i%4===2?new Date():undefined,sentAt:i%4===2?new Date():undefined,isDemo:true
 });
}
await LeadSource.deleteMany({name:/^Demo/});
await LeadSource.insertMany([
 {name:"Demo Reddit",type:"Reddit",keywords:["react","developer"],subreddits:["forhire"],enabled:false},
 {name:"Demo Startup RSS",type:"RSS",apiUrl:"https://example.com/feed.xml",keywords:["startup"],enabled:false},
 {name:"Demo GitHub",type:"GitHub",keywords:["react","node"],enabled:false},
 {name:"Demo Opportunity API",type:"Opportunity API",apiUrl:"https://example.com/api/opportunities",enabled:false}
]);
await CompanySettings.findOneAndUpdate({},{
 companyName:"Kognitribe Global Solutions",
 description:"AI-assisted lead discovery and personalized B2B outreach for technology opportunities.",
 website:"https://kognitribe.co.in",
 contactEmail:"contact@kognitribe.co.in",
 emailSignature:"Kognitribe Global Solutions",
 services:services.map((title)=>({title,description:`${title} for modern businesses.`,technologies:["React","Node.js","MongoDB"]}))
},{upsert:true,new:true});
await AISettings.findOneAndUpdate({}, {provider:"openai-compatible",model:process.env.AI_MODEL||"gpt-4o-mini",enabled:true},{upsert:true});
console.log("Demo data seeded.");
process.exit(0);
