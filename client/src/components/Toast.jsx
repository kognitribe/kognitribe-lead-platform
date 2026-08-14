import React from "react";
export default function Toast({message,onClose}){
 if(!message)return null;
 return <div className="fixed bottom-5 right-5 z-50 glass rounded-xl px-4 py-3 shadow-2xl flex gap-3 items-center text-sm">{message}<button onClick={onClose} className="text-slate-400">×</button></div>
}
