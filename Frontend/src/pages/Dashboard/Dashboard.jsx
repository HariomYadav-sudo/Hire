import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components';
import {
  TrendingUp,
  Target,
  FileCheck2,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  BriefcaseBusiness,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    resumeScore: '0%',
    savedCount: 0,
    appliedCount: 0,
    suggestionsCount: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyStates, setApplyStates] = useState({});

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, recsData, sugData] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getRecommendations(),
          api.dashboard.getSuggestions()
        ]);
        setStats(statsData.stats);
        setRecommendations(recsData.recommendations);
        setSuggestions(sugData.suggestions);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleQuickApply = async (internshipId) => {
    if (applyStates[internshipId]) return;
    setApplyStates(prev => ({ ...prev, [internshipId]: 'loading' }));

    try {
      await api.internships.apply(internshipId);
      setApplyStates(prev => ({ ...prev, [internshipId]: 'success' }));
      // Reload stats after applying
      const statsData = await api.dashboard.getStats();
      setStats(statsData.stats);
    } catch (err) {
      console.error('Quick apply failed:', err);
      setApplyStates(prev => ({ ...prev, [internshipId]: 'error' }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center">
          <div className="size-10 animate-spin rounded-full border-4 border-[#8B5CF6] border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading your career dashboard...</p>
        </div>
      </div>
    );
  }

  // Determine standard greeting time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      {/* Top Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            {greeting}, {user?.name || 'Student'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Here is your current career progress and matching internships.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/resume-studio')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-900/30 hover:opacity-95 transition"
          >
            <Sparkles className="size-4" />
            Resume Studio
          </button>
        </div>
      </div>

      {/* Stats Cards Dashboard Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Resume Score', value: stats.resumeScore, icon: FileCheck2, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
          { label: 'Saved Positions', value: stats.savedCount, icon: Target, color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10' },
          { label: 'Applications', value: stats.appliedCount, icon: TrendingUp, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
          { label: 'AI Suggestions', value: stats.suggestionsCount, icon: Lightbulb, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="flex flex-col justify-between p-4 border-white/5 bg-[#111827]/70 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className={`grid size-9 place-items-center rounded-lg ${item.bg} ${item.color}`}>
                  <Icon className="size-4.5" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recommendations & AI Suggestions Split Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recommended Internships Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BriefcaseBusiness className="size-5 text-[#8B5CF6]" />
              Smart Opportunity Matches
            </h2>
            <Link to="/internships" className="text-xs text-[#A78BFA] hover:text-white flex items-center gap-1 transition">
              Explore all <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid gap-4">
            {recommendations.length > 0 ? (
              recommendations.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-[#111827]/80 p-5 shadow-lg backdrop-blur-md sm:flex-row sm:items-center transition hover:border-[#8B5CF6]/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-slate-800 border border-white/10 text-white font-bold text-sm uppercase">
                      {item.company.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white group-hover:text-[#A78BFA] transition">{item.role}</h3>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          {item.matchPercentage} match
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.company}</p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="size-3" />{item.location}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" />{item.duration}</span>
                        <span className="text-[#06B6D4] font-semibold">{item.stipend}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-stretch gap-2 shrink-0">
                    <button
                      onClick={() => handleQuickApply(item.id)}
                      disabled={applyStates[item.id] === 'success' || applyStates[item.id] === 'loading'}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                        applyStates[item.id] === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : applyStates[item.id] === 'loading'
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-white text-slate-900 hover:opacity-90'
                      }`}
                    >
                      {applyStates[item.id] === 'success' ? 'Applied' : applyStates[item.id] === 'loading' ? 'Applying...' : 'Quick Apply'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/5 bg-[#111827]/40 p-8 text-center">
                <p className="text-xs text-slate-400">No matching recommendations found yet. Complete your skills profile in the Resume Studio to unlock optimized matches!</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Action Suggestions Box */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="size-5 text-[#06B6D4]" />
            Career Copilot Insights
          </h2>

          <div className="rounded-2xl border border-[#06B6D4]/10 bg-gradient-to-br from-[#06B6D4]/5 to-transparent p-5 backdrop-blur-md space-y-4">
            {suggestions.map((item) => (
              <div key={item.id} className="flex items-start gap-3 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <CheckCircle2 className="size-4.5 text-[#06B6D4] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/career-copilot')}
              className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.07] hover:text-white transition"
            >
              Ask AI Mentorship Chat
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
