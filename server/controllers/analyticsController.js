import Lead from "../models/Lead.js";
import EmailCampaign from "../models/EmailCampaign.js";

export async function dashboard(req,res,next){try{
 const [totalLeads,newLeads,qualified,highIntent,generated,approved,sent,replies,conversions]=await Promise.all([
  Lead.countDocuments(),Lead.countDocuments({createdAt:{$gte:new Date(Date.now()-7*864e5)}}),
  Lead.countDocuments({status:"Qualified"}),Lead.countDocuments({intent:"High Intent"}),
  EmailCampaign.countDocuments(),EmailCampaign.countDocuments({status:"Approved"}),EmailCampaign.countDocuments({status:"Sent"}),
  EmailCampaign.countDocuments({repliedAt:{$ne:null}}),Lead.countDocuments({status:"Converted"})
 ]);
 const [bySource,byService,score]=await Promise.all([
  Lead.aggregate([{$group:{_id:"$source",value:{$sum:1}}},{$sort:{value:-1}}]),
  Lead.aggregate([{$unwind:"$matchedServices"},{$group:{_id:"$matchedServices",value:{$sum:1}}},{$sort:{value:-1}}]),
  Lead.aggregate([{$bucket:{groupBy:"$leadScore",boundaries:[0,25,50,75,90,101],default:"Other",output:{value:{$sum:1}}}}])
 ]);
 const rate=sent?Math.round((replies/sent)*100):0;
 res.json({kpis:{totalLeads,newLeads,qualified,highIntent,generated,approved,sent,replies,conversions,replyRate:rate,conversionRate:sent?Math.round(conversions/sent*100):0},bySource,byService,score});
}catch(e){next(e)}}
export async function leads(req,res,next){try{
 const rows=await Lead.aggregate([{$group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$createdAt"}},value:{$sum:1}}},{$sort:{_id:1}},{$limit:30}]);res.json(rows)
}catch(e){next(e)}}
export async function emails(req,res,next){try{
 const rows=await EmailCampaign.aggregate([{$group:{_id:"$status",value:{$sum:1}}}]);res.json(rows)
}catch(e){next(e)}}
