import { Router } from "express";
import { list,get,update,approve,reject,send } from "../controllers/emailController.js";
import { auth } from "../middleware/auth.js";
const r=Router();r.use(auth);r.get("/",list);r.get("/:id",get);r.put("/:id",update);r.post("/:id/approve",approve);r.post("/:id/send",send);r.post("/:id/reject",reject);r.post("/:id/regenerate",async(req,res,next)=>{const {regenerate}=await import("../controllers/aiController.js");regenerate(req,res,next)});export default r;
