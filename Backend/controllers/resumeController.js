import { GoogleGenAI } from '@google/genai';
import { findUserById, saveUser } from '../db.js';

export async function generateResume(req, res) {
  try {
    const userId = req.user.id;
    const user = findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { name, college, degree, skills, projects, achievements } = req.body;

    // Convert comma-separated string skills to array if needed
    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const parsedProjects = Array.isArray(projects) ? projects : [];
    const parsedAchievements = Array.isArray(achievements) ? achievements : [];

    // Save profile improvements to user model
    user.name = name || user.name;
    user.college = college || user.college;
    user.degree = degree || user.degree;
    user.skills = parsedSkills;
    user.projects = parsedProjects;
    user.achievements = parsedAchievements;

    // Initialize Gemini API if key is available
    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponse = null;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `
You are an expert tech recruiter and ATS resume optimizer.
Review the following student profile details and generate a JSON response.

Student Profile:
Name: ${user.name}
College: ${user.college}
Degree: ${user.degree}
Skills: ${user.skills.join(', ')}
Projects: ${JSON.stringify(user.projects)}
Achievements: ${JSON.stringify(user.achievements)}

Please return a valid JSON object matching the following structure:
{
  "summary": "A 3-4 sentence professional summary highlighting their strengths, technologies, and career trajectory.",
  "suggestions": [
    "Suggestion 1 for improving project descriptions (e.g. use action verbs, add metrics)",
    "Suggestion 2 regarding education or layout formatting",
    "Suggestion 3 regarding technical focus"
  ],
  "missingSkills": [
    "Technical skill 1 that fits their projects but isn't listed",
    "Technical skill 2 (tool, framework, or utility)",
    "Technical skill 3 (testing, security, or cloud tools)"
  ],
  "recommendations": [
    "SaaS Backend/Frontend role fits",
    "Startup environments using stack X",
    "Certification or portfolio enhancement suggestions"
  ]
}

Respond ONLY with the JSON code block. Do not include markdown code block formatting (e.g. \`\`\`json). Just the raw JSON.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text ? response.text.trim() : '';
        // Extract raw JSON if LLM returned it wrapped in ```json
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          aiResponse = JSON.parse(text);
        }
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to mock response:', geminiError.message);
      }
    }

    // High quality mock AI fallback if Gemini key isn't active or failed to parse
    if (!aiResponse) {
      const skillsStr = user.skills.length > 0 ? user.skills.slice(0, 4).join(', ') : 'modern frameworks';
      const fallbackSummary = `Results-oriented student studying ${user.degree || 'Computer Science'} at ${user.college || 'university'}. Possesses hands-on experience building web application tools and writing scalable codebase features using ${skillsStr}. Passionate about solving critical tech challenges and driving user success in backend or frontend roles.`;

      aiResponse = {
        summary: fallbackSummary,
        suggestions: [
          'Enhance project listings by adding quantitative metrics (e.g., "improved load time by 30%", "reduced bundle size by 15KB").',
          'Ensure every project has a working deployment link and a descriptive README on GitHub.',
          'Start describing project achievements with powerful action verbs like "Architected", "Engineered", or "Pioneered".'
        ],
        missingSkills: [
          'TypeScript (highly requested for frontend roles)',
          'Docker containerization',
          'CI/CD pipeline automation (GitHub Actions)'
        ],
        recommendations: [
          'Target Frontend/Software Developer Intern roles at early-stage SaaS startups.',
          'Build a comprehensive portfolio site demonstrating responsiveness and state management.',
          'Engage in open-source projects to showcase collaborative version control experience.'
        ]
      };
    }

    // Save summary inside user model
    user.summary = aiResponse.summary;

    // Recalculate completeness
    let score = 0;
    if (user.name) score += 10;
    if (user.email) score += 10;
    if (user.college) score += 15;
    if (user.degree) score += 15;
    if (user.summary) score += 20;
    if (user.skills && user.skills.length > 0) score += 15;
    if (user.projects && user.projects.length > 0) score += 15;
    user.resumeCompletedPercentage = Math.min(score, 100);

    saveUser(user);

    return res.status(200).json({
      message: 'Resume analyzed and summary generated successfully!',
      user: {
        id: user.id,
        name: user.name,
        college: user.college,
        degree: user.degree,
        skills: user.skills,
        projects: user.projects,
        achievements: user.achievements,
        summary: user.summary,
        resumeCompletedPercentage: user.resumeCompletedPercentage
      },
      analysis: aiResponse
    });

  } catch (error) {
    console.error('AI Resume Generation Error:', error);
    return res.status(500).json({ message: 'Internal server error during resume generation.' });
  }
}
