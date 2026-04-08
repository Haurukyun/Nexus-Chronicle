import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EditorGroupProps {
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    isWikiMode: boolean;
}

export const EditorGroup = ({ title, icon: Icon, children, isWikiMode }: EditorGroupProps) => (
    <div className={`mb-8 border rounded-2xl shadow-lg \${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-700'}`}>
        <div className={`px-6 py-3 border-b flex items-center gap-3 rounded-t-2xl \${isWikiMode ? 'bg-[#f5e6d3] border-[#d4c8af]' : 'bg-slate-900/80 border-slate-800'}`}>
            <Icon size={16} className={isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'} />
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] \${isWikiMode ? 'text-[#854d0e]' : 'text-[#fef08a]'}`}>{title}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {children}
        </div>
    </div>
);
