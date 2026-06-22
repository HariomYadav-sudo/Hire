import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Middleware imports
import authMiddleware from './middleware/authMiddleware.js';

// Controller imports
import { signup, login, getMe } from './controllers/authController.js';
import {
  listInternships,
  getInternship,
  applyInternship,
  saveInternship,
  unsaveInternship,
  getSavedInternshipsList,
  getAppliedInternshipsList
} from './controllers/internshipController.js';
import {
  getDashboardStats,
  getRecommendedInternships,
  getAISuggestions
} from './controllers/dashboardController.js';
import { generateResume } from './controllers/resumeController.js';
import { chatCopilot } from './controllers/copilotController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'HireHub API is running and ready for career acceleration.',
    version: '1.0.0'
  });
});

// Authentication Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authMiddleware, getMe);

// Internship Routes
app.get('/api/internships', authMiddleware, listInternships);
app.get('/api/internships/:id', authMiddleware, getInternship);
app.post('/api/internships/:id/apply', authMiddleware, applyInternship);
app.post('/api/internships/:id/save', authMiddleware, saveInternship);
app.delete('/api/internships/:id/save', authMiddleware, unsaveInternship);
app.get('/api/saved-internships', authMiddleware, getSavedInternshipsList);
app.get('/api/applied-internships', authMiddleware, getAppliedInternshipsList);

// Dashboard Routes
app.get('/api/dashboard/stats', authMiddleware, getDashboardStats);
app.get('/api/dashboard/recommendations', authMiddleware, getRecommendedInternships);
app.get('/api/dashboard/suggestions', authMiddleware, getAISuggestions);

// AI Features Routes
app.post('/api/resume/generate', authMiddleware, generateResume);
app.post('/api/copilot/chat', authMiddleware, chatCopilot);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'A server error occurred. Please try again later.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 HireHub Backend Server is active on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`===============================================`);
});
