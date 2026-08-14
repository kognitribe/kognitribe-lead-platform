import { Router } from "express";
import { dashboard,leads,emails } from "../controllers/analyticsController.js";
import { auth } from "../middleware/auth.js";
const r=Router();r.use(auth);r.get("/dashboard",dashboard);r.get("/leads",leads);r.get("/emails",emails);export default r;
