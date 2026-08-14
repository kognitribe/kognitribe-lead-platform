import Lead from "../models/Lead.js";
import EmailCampaign from "../models/EmailCampaign.js";
import CompanySettings from "../models/CompanySettings.js";
import AISettings from "../models/AISettings.js";
import { analyzeLead, generateEmail } from "../services/ai/AIService.js";

export async function analyze(req,res,next){try{
 const lead=await Lead.findById(req.body.leadId); if(!lead)return res.status(404).json({message:"Lead not found"});
 const settings=await AISettings.findOne().lean()||{}; res.json(await analyzeLead(lead,settings));
}catch(e){next(e)}}

export async function email(req,res,next){try{
 const lead=await Lead.findById(req.body.leadId); if(!lead)return res.status(404).json({message:"Lead not found"});
 const company=await CompanySettings.findOne().lean() || {companyName:"Kognitribe Global Solutions",services:[]};
 const settings=await AISettings.findOne().lean()||{};
 const generated=await generateEmail(lead,company,settings);
 const campaign=await EmailCampaign.create({leadId:lead._id,userId:req.user._id,...generated,status:"Ready for Review"});
 res.status(201).json(campaign);
}catch(e){next(e)}}

export async function regenerate(req,res,next){try{
 const campaign=await EmailCampaign.findById(req.params.id); if(!campaign)return res.status(404).json({message:"Email not found"});
 const lead=await Lead.findById(campaign.leadId);
 const company=await CompanySettings.findOne().lean() || {companyName:"Kognitribe Global Solutions",services:[]};
 const settings=await AISettings.findOne().lean()||{};
 const generated=await generateEmail(lead,company,settings);
 campaign.subject=generated.subject;campaign.body=generated.body;campaign.status="Ready for Review";await campaign.save();
 res.json(campaign);
}catch(e){next(e)}}
