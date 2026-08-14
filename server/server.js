import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import aiRoutes from "./routes/ai.js";
import emailRoutes from "./routes/emails.js";
import sourceRoutes from "./routes/sources.js";
import analyticsRoutes from "./routes/analytics.js";
import settingsRoutes from "./routes/settings.js";
import complianceRoutes from "./routes/compliance.js";
import { notFound,errorHandler } from "./middleware/error.js";

const app=express();
app.use(helmet());
app.use(cors({origin:process.env.CLIENT_URL||"http://localhost:5173",credentials:true}));
app.use(express.json({limit:"1mb"}));
app.use(cookieParser());
app.use(rateLimit({windowMs:15*60*1000,max:500,standardHeaders:true,legacyHeaders:false}));

app.get("/api/health",(req,res)=>res.json({ok:true,service:"kognitribe-lead-platform",time:new Date().toISOString()}));
app.use("/api/auth",authRoutes);
app.use("/api/leads",leadRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/emails",emailRoutes);
app.use("/api/sources",sourceRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/settings",settingsRoutes);
app.use("/api/compliance",complianceRoutes);

app.use(notFound);
app.use(errorHandler);

const port=Number(process.env.PORT||5000);
connectDB().then(()=>app.listen(port,()=>console.log(`API running on http://localhost:${port}`))).catch(e=>{console.error("MongoDB Connection Failed:",e.message);process.exit(1)});
