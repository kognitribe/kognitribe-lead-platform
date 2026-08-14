import CompanySettings from "../models/CompanySettings.js";
import AISettings from "../models/AISettings.js";
import User from "../models/User.js";

const defaultServices = [
 {title:"Web Development",description:"Modern, scalable websites and web applications.",technologies:["React","Node.js","MongoDB"]},
 {title:"Cloud Solutions",description:"Cloud architecture, deployment, migration and optimization.",technologies:["AWS","Azure","Docker"]},
 {title:"Data Engineering",description:"ETL/ELT pipelines, data platforms, processing and analytics.",technologies:["Python","SQL","ETL"]},
 {title:"AI & Machine Learning",description:"AI applications, ML solutions and intelligent automation.",technologies:["Python","LLMs","ML"]},
 {title:"3D Design",description:"3D modeling, visualization and digital experiences.",technologies:["Blender","3D"]},
 {title:"Frontend Development",description:"Responsive, modern frontend applications.",technologies:["React","JavaScript"]},
 {title:"Backend Development",description:"Scalable APIs, databases and backend systems.",technologies:["Node.js","Express","MongoDB"]}
];

export async function companyGet(req,res,next){try{let x=await CompanySettings.findOne();if(!x)x=await CompanySettings.create({services:defaultServices});res.json(x)}catch(e){next(e)}}
export async function companyPut(req,res,next){try{res.json(await CompanySettings.findOneAndUpdate({},req.body,{new:true,upsert:true}))}catch(e){next(e)}}
export async function aiGet(req,res,next){try{let x=await AISettings.findOne();if(!x)x=await AISettings.create({});res.json({...x.toObject(),apiKey:x.apiKey?"••••••••":""})}catch(e){next(e)}}
export async function aiPut(req,res,next){try{
 const payload={...req.body}; if(payload.apiKey==="••••••••")delete payload.apiKey;
 res.json(await AISettings.findOneAndUpdate({},payload,{new:true,upsert:true}))
}catch(e){next(e)}}
export async function users(req,res,next){try{res.json(await User.find().select("-password").sort({createdAt:-1}))}catch(e){next(e)}}
export async function role(req,res,next){try{
 const x=await User.findByIdAndUpdate(req.params.id,{role:req.body.role},{new:true}).select("-password");res.json(x)
}catch(e){next(e)}}
export async function emailConfig(req,res){res.json({smtpConfigured:Boolean(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASSWORD),emailFrom:process.env.EMAIL_FROM||""})}
export async function compliance(req,res){res.json({maxPerHour:Number(process.env.MAX_EMAILS_PER_HOUR||10),maxPerDay:Number(process.env.MAX_EMAILS_PER_DAY||50),maxPerCampaign:Number(process.env.MAX_EMAILS_PER_CAMPAIGN||20)})}
