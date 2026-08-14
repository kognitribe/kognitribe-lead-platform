import LeadSource from "../models/LeadSource.js";
import { fetchFromSource } from "../services/sources/index.js";
import { processLeads } from "../services/leadProcessor.js";

export async function runCollectionJob() {
  const sources=await LeadSource.find({enabled:true});
  for(const source of sources){
    try{
      const raw=await fetchFromSource(source.toObject());
      const result=await processLeads(raw,source.name);
      source.lastSync=new Date();source.lastError="";source.leadsCollected+=result.created;await source.save();
    }catch(e){source.lastError=e.message;await source.save();}
  }
}
