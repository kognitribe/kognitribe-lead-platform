import { Router } from "express";
import { analyze,email,regenerate } from "../controllers/aiController.js";
import { auth } from "../middleware/auth.js";
const r=Router();r.use(auth);r.post("/analyze-lead",analyze);r.post("/generate-email",email);r.post("/regenerate-email/:id",regenerate);r.post("/generate-followup",email);export default r;
