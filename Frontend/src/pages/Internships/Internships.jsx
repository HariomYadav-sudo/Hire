import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components';
import { Search, MapPin, Clock, Heart, Briefcase, BookmarkCheck, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'saved', 'applied'

  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applyState, setApplyState] = useState('');

  // Fetch all internships, saved list, and applied list
  async function loadData() {
    try {
      const filters = {};
      if (search) filters.search = search;
      if (locationFilter) filters.location = locationFilter;
      if (durationFilter) filters.duration = durationFilter;

      const [internsData, savedData, appliedData] = await Promise.all([
        api.internships.list(filters),
        api.internships.getSaved(),
        api.internships.getApplied()
      ]);

      setInternships(internsData.internships);
      setSavedIds(new Set(savedData.savedInternships.map(s => s.internshipId)));
      setAppliedIds(new Set(appliedData.applications.map(a => a.internshipId)));

      // Set default selected internship if none is chosen
      if (internsData.internships.length > 0 && !selectedInternship) {
        setSelectedInternship(internsData.internships[0]);
      }
    } catch (err) {
      console.error('Failed to load internships:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, locationFilter, durationFilter]);

  const handleSaveToggle = async (internshipId) => {
    try {
      if (savedIds.has(internshipId)) {
        await api.internships.unsave(internshipId);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(internshipId);
          return next;
        });
      } else {
        await api.internships.save(internshipId);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.add(internshipId);
          return next;
        });
      }
    } catch (err) {
      console.error('Save toggle failed:', err);
    }
  };

  const handleApply = async (internshipId) => {
    if (appliedIds.has(internshipId)) return;
    setApplyState('loading');

    try {
      await api.internships.apply(internshipId);
      setAppliedIds(prev => {
        const next = new Set(prev);
        next.add(internshipId);
        return next;
      });
      setApplyState('success');
      setTimeout(() => setApplyState(''), 3000);
    } catch (err) {
      console.error('Apply failed:', err);
      setApplyState('error');
      setTimeout(() => setApplyState(''), 3000);
    }
  };

  // Filter listings by tab selection
  const displayedList = internships.filter(item => {
    if (activeTab === 'saved') return savedIds.has(item.id);
    if (activeTab === 'applied') return appliedIds.has(item.id);
    return true;
  });

  if (loading && internships.length === 0) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center">
          <div className="size-10 animate-spin rounded-full border-4 border-[#8B5CF6] border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading internships board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Search & Filter Header */}
      <div className="shrink-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="size-6 text-[#8B5CF6]" />
            Internship Discovery
          </h1>
          <p className="text-xs text-slate-400 mt-1">Discover, filter, and apply directly to matching developer positions.</p>
        </div>

        {/* Action bar and Search Input */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1.5 bg-slate-900 border border-white/5 p-1 rounded-xl w-fit">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'saved', label: 'Saved' },
              { id: 'applied', label: 'Applied' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (displayedList.length > 0) setSelectedInternship(displayedList[0]);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#8B5CF6]/15 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
              <Search className="size-4" />
            </span>
            <input
              type="text"
              placeholder="Search by company, role, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
            />
          </div>
        </div>

        {/* Filters Select */}
        <div className="flex flex-wrap gap-2 pt-1">
          {/* Location filters */}
          {[
            { value: '', label: 'All Locations' },
            { value: 'remote', label: 'Remote Only' },
            { value: 'hybrid', label: 'Hybrid Only' },
            { value: 'on-site', label: 'On-site Only' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setLocationFilter(opt.value)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition ${
                locationFilter === opt.value
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-white'
                  : 'border-white/5 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}

          {/* Duration Filters */}
          <div className="h-7 w-px bg-white/10 mx-1" />
          {[
            { value: '', label: 'All Durations' },
            { value: '3', label: '3 Months' },
            { value: '6', label: '6 Months' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setDurationFilter(opt.value)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition ${
                durationFilter === opt.value
                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-white'
                  : 'border-white/5 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main split display listing */}
      <div className="flex-1 min-h-0 grid gap-6 md:grid-cols-5">
        {/* Left Side: Job Card List */}
        <div className="md:col-span-2 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {displayedList.length > 0 ? (
            displayedList.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedInternship(item)}
                className={`cursor-pointer rounded-2xl border p-4 transition relative flex items-start gap-3 bg-[#111827]/70 backdrop-blur-sm ${
                  selectedInternship?.id === item.id
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/5'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                {/* Logo placeholder */}
                <div className="grid size-10 place-items-center rounded-xl bg-slate-800 border border-white/5 font-bold text-xs shrink-0 text-white">
                  {item.company.charAt(0)}
                </div>
                
                {/* Basic info */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-100 truncate">{item.role}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.company}</p>
                  
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2.5">
                    <span className="flex items-center gap-0.5"><MapPin className="size-2.5" />{item.location}</span>
                    <span className="text-[#06B6D4] font-semibold">{item.stipend}</span>
                  </div>
                </div>

                {/* Bookmark/Apply Status Indicator */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveToggle(item.id);
                    }}
                    className={`grid size-7 place-items-center rounded-lg hover:bg-white/5 transition ${
                      savedIds.has(item.id) ? 'text-[#8B5CF6]' : 'text-slate-500'
                    }`}
                  >
                    <Heart className="size-3.5 fill-current" />
                  </button>
                  {appliedIds.has(item.id) && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-400">
                      Applied
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 rounded-2xl border border-white/5 bg-[#111827]/20">
              <p className="text-xs text-slate-400">No matching internships listed.</p>
            </div>
          )}
        </div>

        {/* Right Side: Selected Job Detail View */}
        <div className="md:col-span-3 overflow-y-auto rounded-2xl border border-white/5 bg-[#111827]/50 p-6 flex flex-col justify-between">
          {selectedInternship ? (
            <div className="space-y-6">
              {/* Detailed Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-5">
                <div className="flex gap-4">
                  <div className="grid size-14 place-items-center rounded-xl bg-slate-800 border border-white/10 font-extrabold text-lg text-white">
                    {selectedInternship.company.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">{selectedInternship.role}</h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedInternship.company}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mt-3">
                      <span className="flex items-center gap-1"><MapPin className="size-3" />{selectedInternship.location}</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" />{selectedInternship.duration}</span>
                      <span className="text-[#06B6D4] font-semibold">{selectedInternship.stipend}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveToggle(selectedInternship.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition ${
                    savedIds.has(selectedInternship.id)
                      ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-white'
                      : 'border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Heart className={`size-3.5 ${savedIds.has(selectedInternship.id) ? 'fill-current' : ''}`} />
                  {savedIds.has(selectedInternship.id) ? 'Saved' : 'Save'}
                </button>
              </div>

              {/* Description Body */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Job Description</h4>
                  <p className="text-xs leading-relaxed text-slate-400 mt-2">{selectedInternship.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300">Key Requirements</h4>
                  <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5 mt-2">
                    {selectedInternship.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInternship.skills.map((skill, index) => (
                      <span key={index} className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-300 border border-white/5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Action bar */}
              <div className="border-t border-white/5 pt-5 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <BookmarkCheck className="size-4 text-[#22C55E]" />
                  <span>Resume matches skills</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(selectedInternship.id)}
                  disabled={appliedIds.has(selectedInternship.id) || applyState === 'loading'}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 ${
                    appliedIds.has(selectedInternship.id)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : applyState === 'loading'
                      ? 'bg-slate-800 text-slate-500 cursor-wait'
                      : 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white hover:opacity-95'
                  }`}
                >
                  {appliedIds.has(selectedInternship.id) ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Applied
                    </>
                  ) : applyState === 'loading' ? (
                    'Applying...'
                  ) : (
                    'Apply Now'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <FileText className="size-10 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">Select an internship listing to review specifications and apply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
