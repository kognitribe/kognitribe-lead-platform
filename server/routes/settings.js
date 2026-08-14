import { Router } from "express";
import { auth,adminOnly } from "../middleware/auth.js";
import { companyGet,companyPut,aiGet,aiPut,users,role,emailConfig,compliance } from "../controllers/settingsController.js";
const r=Router();r.use(auth);r.get("/company",companyGet);r.put("/company",adminOnly,companyPut);r.get("/ai",aiGet);r.put("/ai",adminOnly,aiPut);r.get("/email",emailConfig);r.get("/compliance",compliance);r.get("/users",adminOnly,users);r.put("/users/:id/role",adminOnly,role);export default r;
