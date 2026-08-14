import { Router } from "express";
import { list,get,create,update,remove,analyze } from "../controllers/leadController.js";
import { auth } from "../middleware/auth.js";
const r=Router();r.use(auth);r.get("/",list);r.get("/:id",get);r.post("/",create);r.put("/:id",update);r.delete("/:id",remove);r.post("/:id/analyze",analyze);export default r;
