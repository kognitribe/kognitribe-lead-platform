import EmailCampaign from "../models/EmailCampaign.js";
import Lead from "../models/Lead.js";
import { sendApprovedEmail } from "../services/email/EmailService.js";

export async function list(req,res,next){try{
 const items=await EmailCampaign.find().populate("leadId").populate("approvedBy","name email").sort({createdAt:-1});
 res.json(items);
}catch(e){next(e)}}
export async function get(req,res,next){try{
 const x=await EmailCampaign.findById(req.params.id).populate("leadId");if(!x)return res.status(404).json({message:"Email not found"});res.json(x)
}catch(e){next(e)}}
export async function update(req,res,next){try{
 const x=await EmailCampaign.findByIdAndUpdate(req.params.id,{subject:req.body.subject,body:req.body.body,status:"Ready for Review"},{new:true});
 res.json(x)
}catch(e){next(e)}}
export async function approve(req,res,next){try{
 const x=await EmailCampaign.findById(req.params.id);if(!x)return res.status(404).json({message:"Email not found"});
 x.status="Approved";x.approvedBy=req.user._id;x.approvedAt=new Date();await x.save();res.json(x)
}catch(e){next(e)}}
export async function reject(req,res,next){try{
 const x=await EmailCampaign.findByIdAndUpdate(req.params.id,{status:"Rejected"},{new:true});res.json(x)
}catch(e){next(e)}}
export async function send(req,res,next){try{
 const campaign=await EmailCampaign.findById(req.params.id); if(!campaign)return res.status(404).json({message:"Email not found"});
 const lead=await Lead.findById(campaign.leadId); if(!lead)return res.status(404).json({message:"Lead not found"});
 const result=await sendApprovedEmail(campaign,lead);
 campaign.status="Sent";campaign.sentAt=new Date();campaign.sendResult=result.messageId;await campaign.save();
 lead.status="Contacted";await lead.save();
 res.json(campaign);
}catch(e){
 const campaign=await EmailCampaign.findById(req.params.id); if(campaign){campaign.status="Failed";campaign.sendResult=e.message;await campaign.save();}
 res.status(400).json({message:e.message});
}}
