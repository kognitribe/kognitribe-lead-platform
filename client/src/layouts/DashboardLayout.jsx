import React from "react";
import {NavLink,Outlet,useNavigate} from "react-router-dom";
import {LayoutDashboard,Users,MailCheck,Radio,BarChart3,Settings,LogOut,Menu,X,Sparkles} from "lucide-react";
import {useState} from "react";
import {useAuth} from "../context/AuthContext";
const links=[
 ["Dashboard","/dashboard",LayoutDashboard],["Leads","/leads",Users],["Email Queue","/email-queue",MailCheck],
 ["Sources","/sources",Radio],["Analytics","/analytics",BarChart3],["Settings","/settings",Settings]
];
export default function DashboardLayout(){
 const [open,setOpen]=useState(false);const {user,logout}=useAuth();const nav=useNavigate();
 const item=({isActive})=>`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive?"bg-accent text-white":"text-slate-400 hover:bg-white/5 hover:text-white"}`;
 return <div className="min-h-screen flex">
  <aside className={`${open?"translate-x-0":"-translate-x-full"} md:translate-x-0 fixed md:static z-40 inset-y-0 left-0 w-64 glass p-4 transition-transform`}>
   <div className="flex items-center gap-3 px-2 py-3 mb-7"><div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center"><Sparkles size={18}/></div><div><div className="font-bold">Kognitribe</div><div className="text-[10px] text-slate-500">LEAD INTELLIGENCE</div></div><button className="ml-auto md:hidden" onClick={()=>setOpen(false)}><X size={18}/></button></div>
   <nav className="space-y-1">{links.map(([label,to,Icon])=><NavLink key={to} to={to} className={item} onClick={()=>setOpen(false)}><Icon size={18}/>{label}</NavLink>)}</nav>
   <div className="mt-auto pt-8"><div className="border-t border-white/10 pt-4 px-3 text-xs text-slate-500">{user?.name}<br/>{user?.role}</div><button onClick={async()=>{await logout();nav("/login")}} className="mt-3 flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white"><LogOut size={17}/>Logout</button></div>
  </aside>
  <main className="flex-1 min-w-0"><header className="h-16 border-b border-white/10 flex items-center px-4 md:px-7 sticky top-0 bg-ink/80 backdrop-blur z-30"><button className="md:hidden mr-3" onClick={()=>setOpen(true)}><Menu/></button><div className="text-sm text-slate-400">AI-assisted discovery & responsible outreach</div><div className="ml-auto text-xs text-slate-500">Human approval required</div></header><div className="p-4 md:p-7 max-w-[1600px] mx-auto"><Outlet/></div></main>
 </div>
}
