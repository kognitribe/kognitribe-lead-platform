import LeadSource from "../models/LeadSource.js";
import { fetchFromSource } from "../services/sources/index.js";
import { processLeads } from "../services/leadProcessor.js";

export async function list(req,res,next){try{res.json(await LeadSource.find().sort({createdAt:-1}))}catch(e){next(e)}}
export async function create(req,res,next){try{res.status(201).json(await LeadSource.create(req.body))}catch(e){next(e)}}
export async function update(req,res,next){try{res.json(await LeadSource.findByIdAndUpdate(req.params.id,req.body,{new:true}))}catch(e){next(e)}}
export async function remove(req,res,next){try{await LeadSource.findByIdAndDelete(req.params.id);res.json({message:"Deleted"})}catch(e){next(e)}}
export async function sync(req,res,next){
 try{
   const source=await LeadSource.findById(req.params.id);if(!source)return res.status(404).json({message:"Source not found"});
   const raw=await fetchFromSource(source.toObject());
   const result=await processLeads(raw,source.name);
   source.lastSync=new Date();source.lastError="";source.leadsCollected+=result.created;await source.save();
   res.json({message:"Sync completed",...result});
 }catch(e){
   const source=await LeadSource.findById(req.params.id);if(source){source.lastError=e.message;await source.save();}
   res.status(400).json({message:e.message});
 }
}
export async function test(req,res,next){try{
 const source=await LeadSource.findById(req.params.id);const raw=await fetchFromSource(source.toObject());res.json({ok:true,count:raw.length,preview:raw.slice(0,3)});
}catch(e){res.status(400).json({ok:false,message:e.message})}}
