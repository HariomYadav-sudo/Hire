import {
  getInternships,
  getInternshipById,
  saveApplication,
  saveSavedInternship,
  deleteSavedInternship,
  getSavedInternships,
  getApplications
} from '../db.js';

export function listInternships(req, res) {
  try {
    let list = getInternships();
    const { search, role, location, duration } = req.query;

    // Search query matching role, company, or skills
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(item =>
        item.role.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.skills.some(skill => skill.toLowerCase().includes(q))
      );
    }

    // Role filter (exact/substring match)
    if (role) {
      const r = role.toLowerCase();
      list = list.filter(item => item.role.toLowerCase().includes(r));
    }

    // Location filter (e.g. Remote, On-site, Hybrid)
    if (location) {
      const loc = location.toLowerCase();
      list = list.filter(item => item.location.toLowerCase().includes(loc));
    }

    // Duration filter
    if (duration) {
      const dur = duration.toLowerCase();
      list = list.filter(item => item.duration.toLowerCase().includes(dur));
    }

    return res.status(200).json({ internships: list });
  } catch (error) {
    console.error('List Internships Error:', error);
    return res.status(500).json({ message: 'Error retrieving internships.' });
  }
}

export function getInternship(req, res) {
  try {
    const { id } = req.params;
    const item = getInternshipById(id);
    if (!item) {
      return res.status(404).json({ message: 'Internship not found.' });
    }
    return res.status(200).json({ internship: item });
  } catch (error) {
    console.error('Get Internship Error:', error);
    return res.status(500).json({ message: 'Error retrieving internship details.' });
  }
}

export function applyInternship(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const item = getInternshipById(id);
    if (!item) {
      return res.status(404).json({ message: 'Internship not found.' });
    }

    const application = {
      id: 'app-' + Math.random().toString(36).substr(2, 9),
      userId,
      internshipId: id,
      status: 'Applied',
      appliedAt: new Date().toISOString()
    };

    const isNew = saveApplication(application);
    if (!isNew) {
      return res.status(400).json({ message: 'You have already applied to this internship.' });
    }

    return res.status(200).json({
      message: 'Application submitted successfully!',
      application
    });
  } catch (error) {
    console.error('Apply Internship Error:', error);
    return res.status(500).json({ message: 'Error submitting application.' });
  }
}

export function saveInternship(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const item = getInternshipById(id);
    if (!item) {
      return res.status(404).json({ message: 'Internship not found.' });
    }

    const savedItem = {
      id: 'save-' + Math.random().toString(36).substr(2, 9),
      userId,
      internshipId: id,
      savedAt: new Date().toISOString()
    };

    const isNew = saveSavedInternship(savedItem);
    if (!isNew) {
      return res.status(400).json({ message: 'This internship is already saved.' });
    }

    return res.status(200).json({
      message: 'Internship saved successfully!',
      savedItem
    });
  } catch (error) {
    console.error('Save Internship Error:', error);
    return res.status(500).json({ message: 'Error saving internship.' });
  }
}

export function unsaveInternship(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = deleteSavedInternship(userId, id);
    if (!deleted) {
      return res.status(404).json({ message: 'Internship was not in your saved list.' });
    }

    return res.status(200).json({ message: 'Internship removed from saved list.' });
  } catch (error) {
    console.error('Unsave Internship Error:', error);
    return res.status(500).json({ message: 'Error removing saved internship.' });
  }
}

export function getSavedInternshipsList(req, res) {
  try {
    const userId = req.user.id;
    const saved = getSavedInternships(userId);
    const internships = getInternships();

    const result = saved.map(s => {
      const match = internships.find(i => i.id === s.internshipId);
      return {
        ...s,
        internship: match
      };
    }).filter(s => s.internship); // Filter out any stale matches

    return res.status(200).json({ savedInternships: result });
  } catch (error) {
    console.error('Get Saved Internships Error:', error);
    return res.status(500).json({ message: 'Error retrieving saved internships.' });
  }
}

export function getAppliedInternshipsList(req, res) {
  try {
    const userId = req.user.id;
    const apps = getApplications(userId);
    const internships = getInternships();

    const result = apps.map(a => {
      const match = internships.find(i => i.id === a.internshipId);
      return {
        ...a,
        internship: match
      };
    }).filter(a => a.internship);

    return res.status(200).json({ applications: result });
  } catch (error) {
    console.error('Get Applied Internships Error:', error);
    return res.status(500).json({ message: 'Error retrieving applications.' });
  }
}
