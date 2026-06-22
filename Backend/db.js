import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

// Ensure db exists, fallback to empty tables if not
function initializeDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      users: [],
      applications: [],
      savedInternships: [],
      internships: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

initializeDb();

export function readData() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database.json:', error);
    return { users: [], applications: [], savedInternships: [], internships: [] };
  }
}

export function writeData(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing database.json:', error);
    return false;
  }
}

// User Helpers
export function findUserByEmail(email) {
  const data = readData();
  return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  const data = readData();
  return data.users.find(u => u.id === id);
}

export function saveUser(user) {
  const data = readData();
  const index = data.users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    data.users[index] = user;
  } else {
    data.users.push(user);
  }
  writeData(data);
  return user;
}

// Internship Helpers
export function getInternships() {
  const data = readData();
  return data.internships || [];
}

export function getInternshipById(id) {
  const data = readData();
  return data.internships.find(item => item.id === id);
}

// Application Helpers
export function getApplications(userId) {
  const data = readData();
  return data.applications.filter(app => app.userId === userId);
}

export function saveApplication(app) {
  const data = readData();
  // Ensure duplicates aren't submitted for the same user and internship
  const exists = data.applications.some(
    existing => existing.userId === app.userId && existing.internshipId === app.internshipId
  );
  if (!exists) {
    data.applications.push(app);
    writeData(data);
    return true;
  }
  return false;
}

// Saved Internship Helpers
export function getSavedInternships(userId) {
  const data = readData();
  return data.savedInternships.filter(saved => saved.userId === userId);
}

export function saveSavedInternship(savedItem) {
  const data = readData();
  const exists = data.savedSavedInternships || data.savedInternships.some(
    existing => existing.userId === savedItem.userId && existing.internshipId === savedItem.internshipId
  );
  if (!exists) {
    data.savedInternships.push(savedItem);
    writeData(data);
    return true;
  }
  return false;
}

export function deleteSavedInternship(userId, internshipId) {
  const data = readData();
  const originalLength = data.savedInternships.length;
  data.savedInternships = data.savedInternships.filter(
    existing => !(existing.userId === userId && existing.internshipId === internshipId)
  );
  if (data.savedInternships.length !== originalLength) {
    writeData(data);
    return true;
  }
  return false;
}
