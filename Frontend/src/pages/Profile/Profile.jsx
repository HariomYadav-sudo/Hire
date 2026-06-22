import { Card, Button } from '../../components';
import { User, Mail, Calendar, Sparkles, LogOut, Award, BookOpen } from 'lucide-react';

export default function Profile({ user, onLogout }) {
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="size-6 text-[#8B5CF6]" />
          My Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review your login account details and overall career profile completeness status.</p>
      </div>

      <Card className="p-6 border-white/5 bg-[#111827]/70 backdrop-blur-md space-y-6 relative overflow-hidden">
        {/* Glow highlights */}
        <div className="absolute -right-20 -top-20 -z-10 size-48 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
        
        {/* User Large Avatar */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-white/5">
          <div className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] text-white text-3xl font-extrabold shadow-lg shadow-purple-950/20">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-lg font-bold text-white">{user.name}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 justify-center">
            <Mail className="size-3.5" /> {user.email}
          </p>
        </div>

        {/* Detailed Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2"><BookOpen className="size-4 text-[#8B5CF6]" /> College / University</span>
            <span className="font-semibold text-slate-200">{user.college || 'Not set'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2"><Award className="size-4 text-[#06B6D4]" /> Degree / Major</span>
            <span className="font-semibold text-slate-200">{user.degree || 'Not set'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2"><Calendar className="size-4 text-slate-500" /> Account Created</span>
            <span className="font-semibold text-slate-200">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}</span>
          </div>
        </div>

        {/* Dynamic Completeness Card */}
        <div className="rounded-2xl border border-[#06B6D4]/10 bg-gradient-to-br from-[#06B6D4]/5 to-transparent p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-bold text-[#22D3EE]">
              <Sparkles className="size-4" /> Profile Completeness
            </span>
            <span className="font-extrabold text-white">{user.resumeCompletedPercentage || 0}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${user.resumeCompletedPercentage || 0}%` }}
              className="h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] transition-all"
            />
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
            {user.resumeCompletedPercentage < 80 
              ? 'Complete your education details and optimize your resume in the Resume Studio to push your match scores to 100%!'
              : 'Your profile score is exceptional! You are highly optimized for automated internship discovery matching.'}
          </p>
        </div>

        {/* Action Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 py-2.5 text-xs font-bold transition"
        >
          <LogOut className="size-4" />
          Logout Account
        </button>
      </Card>
    </div>
  );
}
