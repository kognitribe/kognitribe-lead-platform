import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function tokenFor(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function setCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});
}
export async function register(req,res,next){
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) return res.status(400).json({message:"Name, email and password (8+ chars) are required"});
    if (await User.findOne({email: email.toLowerCase()})) return res.status(409).json({message:"Email already registered"});
    const user = await User.create({name, email: email.toLowerCase(), password: await bcrypt.hash(password, 12)});
    setCookie(res, tokenFor(user));
    res.status(201).json({user:{id:user._id,name:user.name,email:user.email,role:user.role}});
  } catch(e){next(e)}
}
export async function login(req,res,next){
  try {
    const {email,password}=req.body;
    const user=await User.findOne({email: email?.toLowerCase()});
    if(!user || !(await bcrypt.compare(password||"", user.password))) return res.status(401).json({message:"Invalid email or password"});
    setCookie(res, tokenFor(user));
    res.json({user:{id:user._id,name:user.name,email:user.email,role:user.role}});
  }catch(e){next(e)}
}
export async function logout(req,res){res.clearCookie("token");res.json({message:"Logged out"});}
export async function me(req,res){res.json({user:{id:req.user._id,name:req.user.name,email:req.user.email,role:req.user.role}});}
