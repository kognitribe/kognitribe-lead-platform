import { Router } from "express";
import { list,create,update,remove,sync,test } from "../controllers/sourceController.js";
import { auth,adminOnly } from "../middleware/auth.js";
const r=Router();r.use(auth);r.get("/",list);r.post("/",adminOnly,create);r.put("/:id",adminOnly,update);r.delete("/:id",adminOnly,remove);r.post("/:id/test",adminOnly,test);r.post("/:id/sync",auth,sync);export default r;
