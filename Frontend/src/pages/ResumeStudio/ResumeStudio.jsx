import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, Input, Button } from '../../components';
import html2pdf from 'html2pdf.js';
import {
  FileText,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  Terminal,
  Printer,
  PlusCircle,
  Loader2
} from 'lucide-react';

const SCAN_STEPS = [
  'Initializing AI Resume Studio Optimizer...',
  'Extracting profile metrics and projects metadata...',
  'Connecting to Gemini API (gemini-2.5-flash)...',
  'Evaluating resume against 1,000+ tech job keywords...',
  'Formatting professional summaries and feedback review...'
];

export default function ResumeStudio({ user, onUserUpdate }) {
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [degree, setDegree] = useState(user?.degree || '');
  const [skillsStr, setSkillsStr] = useState(user?.skills?.join(', ') || '');
  const [projects, setProjects] = useState(user?.projects || []);
  const [achievements, setAchievements] = useState(user?.achievements || []);

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [completeness, setCompleteness] = useState(user?.resumeCompletedPercentage || 0);
  const [scanStep, setScanStep] = useState(SCAN_STEPS[0]);

  // Load profile from DB on mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCollege(user.college || '');
      setDegree(user.degree || '');
      setSkillsStr(user.skills?.join(', ') || '');
      setProjects(user.projects || []);
      setAchievements(user.achievements || []);
      setCompleteness(user.resumeCompletedPercentage || 0);
    }
  }, [user]);

  // Project managers
  const handleAddProject = () => {
    setProjects(prev => [...prev, { title: '', role: '', description: '' }]);
  };

  const handleUpdateProject = (index, field, value) => {
    setProjects(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveProject = (index) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  // Achievement managers
  const handleAddAchievement = () => {
    setAchievements(prev => [...prev, '']);
  };

  const handleUpdateAchievement = (index, value) => {
    setAchievements(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveAchievement = (index) => {
    setAchievements(prev => prev.filter((_, i) => i !== index));
  };

  // Click handler to quickly add a missing skill keyword
  const handleAddMissingSkill = (skill) => {
    const trimmed = skillsStr.trim();
    if (!trimmed) {
      setSkillsStr(skill);
      return;
    }
    
    // Check if skill is already in the list
    const currentList = trimmed.split(',').map(s => s.trim().toLowerCase());
    if (!currentList.includes(skill.toLowerCase())) {
      setSkillsStr(prev => `${prev.trim()}, ${skill}`);
    }
  };

  // Run AI Optimization
  const handleOptimize = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Set up step message cycle
    let stepIdx = 0;
    setScanStep(SCAN_STEPS[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % SCAN_STEPS.length;
      setScanStep(SCAN_STEPS[stepIdx]);
    }, 1200);

    try {
      const parsedSkills = skillsStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        name,
        college,
        degree,
        skills: parsedSkills,
        projects,
        achievements
      };

      const res = await api.resume.generate(payload);
      setAnalysis(res.analysis);
      setCompleteness(res.user.resumeCompletedPercentage);
      
      // Update global user state in App.jsx
      if (onUserUpdate) {
        onUserUpdate(res.user);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Optimizing failed:', err);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  // Download PDF resume action using html2pdf.js
  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-pdf-content');
    if (!element) return;

    const opt = {
      margin:       0.3,
      filename:     `${(name || 'student').toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2.5, 
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Dynamic print-media style blocks */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide app wrappers, sidebar, forms, headers */
          #root > div > aside,
          #root > div > main > div > div:first-child,
          #root > div > main > div > div:last-child > div:first-child,
          #root > div > main > div > div:last-child > div:last-child,
          .no-print {
            display: none !important;
          }
          /* Full page printable layout */
          .printable-resume-card {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 2.5cm 2cm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: #334155 !important;
          }
          .printable-resume-card h2 {
            color: #0f172a !important;
          }
          .printable-resume-card h4 {
            color: #1e293b !important;
            border-bottom-color: #cbd5e1 !important;
          }
        }
      `}</style>

      <div className="no-print">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="size-6 text-[#8B5CF6]" />
          AI Resume Studio
        </h1>
        <p className="text-xs text-slate-400 mt-1">Enhance your student resume for Applicant Tracking Systems (ATS) utilizing real-time Gemini recommendations.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Side: Form Editor */}
        <Card className="p-6 border-white/5 bg-[#111827]/70 backdrop-blur-md overflow-hidden no-print">
          <form onSubmit={handleOptimize} className="space-y-6">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 pb-3 border-b border-white/5">
              <Terminal className="size-4 text-[#8B5CF6]" />
              Profile Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anya Sharma"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">College / University</label>
                <Input
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Indian Institute of Technology"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Degree / Course</label>
              <Input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech in Computer Science"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Skills (comma-separated)</label>
              <textarea
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="React, TypeScript, Node.js, Express, SQL, Git"
                className="w-full min-h-16 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                required
              />
            </div>

            {/* Projects Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-slate-400">Featured Projects</label>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="text-xs text-[#06B6D4] hover:text-white flex items-center gap-1 transition"
                >
                  <Plus className="size-3" /> Add Project
                </button>
              </div>

              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={idx} className="rounded-xl border border-white/5 bg-slate-900/60 p-4 space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        value={proj.title}
                        onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                        placeholder="Project Title"
                        required
                      />
                      <Input
                        value={proj.role}
                        onChange={(e) => handleUpdateProject(idx, 'role', e.target.value)}
                        placeholder="Your Role (e.g. Frontend Developer)"
                        required
                      />
                    </div>
                    <textarea
                      value={proj.description}
                      onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                      placeholder="Briefly describe what you built, stack used, and key achievements."
                      className="w-full min-h-14 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-slate-400">Key Achievements</label>
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="text-xs text-[#06B6D4] hover:text-white flex items-center gap-1 transition"
                >
                  <Plus className="size-3" /> Add Achievement
                </button>
              </div>

              <div className="space-y-2">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={ach}
                        onChange={(e) => handleUpdateAchievement(idx, e.target.value)}
                        placeholder="e.g. Won 1st place in National Hackathon 2026"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(idx)}
                      className="text-slate-500 hover:text-red-400 p-2 transition"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Optimizing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Optimize Resume with AI
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Right Side: Resume Live Preview */}
        <div className="space-y-6 flex flex-col">
          {/* Action Toolbar for Resume options */}
          <div className="flex items-center justify-between no-print">
            <span className="text-xs font-semibold text-slate-400">Resume Live Preview</span>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Printer className="size-3.5" />
              Download / Save PDF
            </button>
          </div>

          {/* Main PDF preview layout */}
          <div id="resume-pdf-content" className="printable-resume-card relative overflow-hidden rounded-[16px] border border-slate-700 bg-white p-8 text-slate-800 shadow-xl min-h-[520px] flex flex-col justify-between">
            {/* Loading Scanner Animation Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center text-center p-6 no-print">
                <div className="relative mb-6">
                  {/* Outer spinning dash loader */}
                  <div className="size-16 rounded-full border-4 border-dashed border-[#8B5CF6] animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto size-6 text-[#06B6D4] animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Analyzing Resume Metrics</h3>
                <p className="text-xs text-[#06B6D4] animate-pulse h-4 max-w-xs">{scanStep}</p>
                
                {/* Simulated grid scanner laser bar */}
                <div className="absolute left-0 right-0 h-0.5 bg-[#8B5CF6] opacity-60 shadow-[0_0_15px_#8B5CF6] animate-[bounce_2.5s_infinite]" />
              </div>
            )}

            <div>
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{name || 'Your Full Name'}</h2>
                <div className="mt-1 flex justify-center gap-4 text-[10px] text-slate-500">
                  <span>{user?.email || 'email@example.com'}</span>
                  {college && <span>·</span>}
                  <span>{college || 'University Name'}</span>
                </div>
              </div>

              {/* Summary section */}
              <div className="mt-5 space-y-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">Professional Summary</h4>
                <p className="text-[10px] leading-relaxed text-slate-600">
                  {user?.summary || 'Generate an AI summary using the optimizer form.'}
                </p>
              </div>

              {/* Education section */}
              {degree && (
                <div className="mt-5 space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">Education</h4>
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-800">{degree}</span>
                    <span className="text-slate-500">{college}</span>
                  </div>
                </div>
              )}

              {/* Skills section */}
              {skillsStr && (
                <div className="mt-5 space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">Technical Skills</h4>
                  <p className="text-[10px] text-slate-700 leading-relaxed">
                    {skillsStr}
                  </p>
                </div>
              )}

              {/* Projects section */}
              {projects.length > 0 && (
                <div className="mt-5 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">Academic & Personal Projects</h4>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="text-[10px]">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{proj.title || 'Untitled Project'}</span>
                        <span className="font-normal text-slate-500">{proj.role}</span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-normal">{proj.description || 'No description added yet.'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements section */}
              {achievements.length > 0 && (
                <div className="mt-5 space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">Achievements</h4>
                  <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-1">
                    {achievements.map((ach, idx) => (
                      <li key={idx}>{ach}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom PDF footer tag */}
            <div className="mt-8 border-t border-slate-100 pt-3 text-center text-[8px] text-slate-400">
              Verified by HireHub ATS Resume Studio
            </div>
          </div>

          {/* AI Analysis feedback panel */}
          {analysis && (
            <div className="rounded-2xl border border-[#06B6D4]/15 bg-gradient-to-br from-[#06B6D4]/5 to-transparent p-5 backdrop-blur-md space-y-4 no-print">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <BrainCircuit className="size-5 text-[#06B6D4]" />
                <h3 className="text-xs font-bold text-white">AI ATS Review Report</h3>
              </div>

              {/* Completeness Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span>ATS Score Completeness</span>
                  <span className="font-bold text-white">{completeness}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${completeness}%` }}
                    className="h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] transition-all duration-500"
                  />
                </div>
              </div>

              {/* Improvement suggestions */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA]">Optimization Feedback</h4>
                <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Missing skills tags */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#06B6D4] flex items-center gap-1.5">
                  Missing Core Keywords
                  <span className="text-[9px] lowercase font-normal text-slate-500">(click tags to quickly add)</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingSkills.map((s, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleAddMissingSkill(s)}
                      className="rounded-md bg-[#06B6D4]/10 hover:bg-[#06B6D4]/25 px-2 py-0.5 text-[10px] font-semibold text-[#22D3EE] border border-[#06B6D4]/20 flex items-center gap-1 transition"
                    >
                      <PlusCircle className="size-3 text-[#22D3EE]/70" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Position Targets</h4>
                <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
