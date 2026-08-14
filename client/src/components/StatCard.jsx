import React from "react";
export default function StatCard({icon:Icon,label,value,sub}){
 return <div className="glass rounded-2xl p-5">
  <div className="flex items-center justify-between"><div className="text-slate-400 text-sm">{label}</div><div className="p-2 rounded-xl bg-accent/10 text-accent"><Icon size={18}/></div></div>
  <div className="mt-3 text-3xl font-semibold">{value}</div><div className="mt-1 text-xs text-slate-500">{sub}</div>
 </div>
}
