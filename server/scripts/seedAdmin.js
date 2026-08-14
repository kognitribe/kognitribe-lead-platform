import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
await connectDB();
const email=(process.env.ADMIN_EMAIL||"admin@kognitribe.co.in").toLowerCase();
const password=process.env.ADMIN_PASSWORD||"ChangeThisImmediately123!";
const existing=await User.findOne({email});
if(existing){existing.role="admin";existing.password=await bcrypt.hash(password,12);await existing.save();console.log("Admin updated:",email);}
else {await User.create({name:process.env.ADMIN_NAME||"Kognitribe Admin",email,password:await bcrypt.hash(password,12),role:"admin"});console.log("Admin created:",email);}
process.exit(0);
