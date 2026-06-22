import { getApplications, getSavedInternships, getInternships, findUserById } from '../db.js';

export function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;
    const user = findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const apps = getApplications(userId);
    const saved = getSavedInternships(userId);

    // Dynamic resume completion score
    let score = 0;
    if (user.name) score += 10;
    if (user.email) score += 10;
    if (user.college) score += 15;
    if (user.degree) score += 15;
    if (user.summary) score += 20;
    if (user.skills && user.skills.length > 0) score += 15;
    if (user.projects && user.projects.length > 0) score += 15;

    // Boundary cap
    score = Math.min(score, 100);

    // Calculate AI Suggestions count
    let suggestionsCount = 0;
    if (!user.college) suggestionsCount++;
    if (!user.summary) suggestionsCount++;
    if (!user.skills || user.skills.length < 3) suggestionsCount++;
    if (!user.projects || user.projects.length === 0) suggestionsCount++;
    if (suggestionsCount === 0) suggestionsCount = 1; // Always have at least 1 career roadmap tip

    return res.status(200).json({
      stats: {
        resumeScore: `${score}%`,
        savedCount: saved.length,
        appliedCount: apps.length,
        suggestionsCount: suggestionsCount
      }
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'Error retrieving dashboard statistics.' });
  }
}

export function getRecommendedInternships(req, res) {
  try {
    const userId = req.user.id;
    const user = findUserById(userId);
    const allInternships = getInternships();

    const userSkills = (user?.skills || []).map(s => s.toLowerCase());

    const recommendations = allInternships.map(item => {
      let matchedSkills = 0;
      item.skills.forEach(skill => {
        if (userSkills.includes(skill.toLowerCase())) {
          matchedSkills++;
        }
      });

      // Calculate matching percentage
      let matchPercentage = 50; // base match
      if (item.skills.length > 0) {
        const ratio = matchedSkills / item.skills.length;
        matchPercentage = Math.round(50 + ratio * 48); // range [50, 98]
      }

      return {
        ...item,
        matchPercentage: `${matchPercentage}%`
      };
    });

    // Sort by match percentage descending
    recommendations.sort((a, b) => parseInt(b.matchPercentage) - parseInt(a.matchPercentage));

    // Return top 3 recommendations
    return res.status(200).json({ recommendations: recommendations.slice(0, 3) });
  } catch (error) {
    console.error('Get Recommended Internships Error:', error);
    return res.status(500).json({ message: 'Error retrieving internship recommendations.' });
  }
}

export function getAISuggestions(req, res) {
  try {
    const userId = req.user.id;
    const user = findUserById(userId);

    const suggestions = [];

    if (!user.college) {
      suggestions.push({
        id: 'sug-1',
        title: 'Education Missing',
        description: 'Add your college details to enable university-specific internship matching.',
        type: 'profile_improvement'
      });
    }

    if (!user.summary) {
      suggestions.push({
        id: 'sug-2',
        title: 'Resume Summary',
        description: 'Generate an AI summary in the Resume Studio to highlight your unique career goals.',
        type: 'resume_builder'
      });
    }

    if (!user.skills || user.skills.length < 3) {
      suggestions.push({
        id: 'sug-3',
        title: 'Expand Skills List',
        description: 'Add at least 3-5 technical skills to optimize your ATS (Applicant Tracking) keyword match.',
        type: 'skills_optimization'
      });
    }

    if (!user.projects || user.projects.length === 0) {
      suggestions.push({
        id: 'sug-4',
        title: 'Project Showcase',
        description: 'List at least one personal or course project with a github link to showcase hands-on work.',
        type: 'portfolio_growth'
      });
    }

    // Default general guidelines
    if (suggestions.length === 0) {
      suggestions.push({
        id: 'sug-5',
        title: 'Resume Polished!',
        description: 'Your profile looks solid! Start chatting with your Career Copilot to customize your interview preparation plan.',
        type: 'general_guidance'
      });
    }

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Get AI Suggestions Error:', error);
    return res.status(500).json({ message: 'Error retrieving AI suggestions.' });
  }
}
