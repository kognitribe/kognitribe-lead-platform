import Lead from "../models/Lead.js";
import AISettings from "../models/AISettings.js";
import { analyzeLead } from "../services/ai/AIService.js";

export async function list(req,res,next){
  try{
    const {search,source,intent,status,minScore,maxScore,page=1,limit=10}=req.query;
    const q={};
    if(search) q.$or=[{name:{$regex:search,$options:"i"}},{company:{$regex:search,$options:"i"}},{title:{$regex:search,$options:"i"}}];
    if(source) q.source=source;
    if(intent) q.intent=intent;
    if(status) q.status=status;
    if(minScore||maxScore) q.leadScore={...(minScore?{$gte:Number(minScore)}:{}),...(maxScore?{$lte:Number(maxScore)}:{})};
    const skip=(Number(page)-1)*Number(limit);
    const [items,total]=await Promise.all([Lead.find(q).sort({createdAt:-1}).skip(skip).limit(Number(limit)),Lead.countDocuments(q)]);
    res.json({items,total,page:Number(page),pages:Math.ceil(total/Number(limit))});
  }catch(e){next(e)}
}
export async function get(req,res,next){try{const x=await Lead.findById(req.params.id);if(!x)return res.status(404).json({message:"Lead not found"});res.json(x)}catch(e){next(e)}}
export async function create(req,res,next){try{const x=await Lead.create(req.body);res.status(201).json(x)}catch(e){next(e)}}
export async function update(req,res,next){try{const x=await Lead.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});res.json(x)}catch(e){next(e)}}
export async function remove(req,res,next){try{await Lead.findByIdAndDelete(req.params.id);res.json({message:"Deleted"})}catch(e){next(e)}}
export async function analyze(req,res,next){
  try{
    const lead=await Lead.findById(req.params.id); if(!lead)return res.status(404).json({message:"Lead not found"});
    const settings=await AISettings.findOne().lean()||{};
    const analysis=await analyzeLead(lead,settings);
    Object.assign(lead,analysis); await lead.save(); res.json(lead);
  }catch(e){next(e)}
}
