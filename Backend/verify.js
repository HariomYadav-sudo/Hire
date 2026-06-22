import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5001; // Use port 5001 for test verification to avoid conflict with running server
const BASE_URL = `http://localhost:${PORT}`;

console.log('Starting backend verification process...');

// Start the backend server as a background process for testing
const serverProcess = spawn('node', ['server.js'], {
  cwd: __dirname,
  env: { ...process.env, PORT: PORT.toString() }
});

let serverOutput = '';
serverProcess.stdout.on('data', (data) => {
  serverOutput += data.toString();
  console.log('[Server Output]:', data.toString().trim());
});

serverProcess.stderr.on('data', (data) => {
  console.error('[Server Error]:', data.toString().trim());
});

// Helper for waiting
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  let token = '';
  let testUserEmail = `testuser-${Math.random().toString(36).substring(7)}@example.com`;
  let testPassword = 'secure123Password!';

  try {
    // Wait for server to boot up
    await sleep(2500);

    console.log('\n--- 1. Testing Root Status ---');
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootData = await rootRes.json();
    console.log('Root response status:', rootRes.status);
    console.log('Root response body:', rootData);
    if (rootRes.status !== 200 || rootData.status !== 'online') {
      throw new Error('Root route verification failed.');
    }

    console.log('\n--- 2. Testing Signup ---');
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Anya Sharma',
        email: testUserEmail,
        password: testPassword
      })
    });
    const signupData = await signupRes.json();
    console.log('Signup status:', signupRes.status);
    console.log('Signup message:', signupData.message);
    if (signupRes.status !== 201 || !signupData.token) {
      throw new Error('Signup failed: ' + JSON.stringify(signupData));
    }
    token = signupData.token;

    console.log('\n--- 3. Testing Login ---');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status);
    console.log('Login message:', loginData.message);
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error('Login failed.');
    }

    console.log('\n--- 4. Testing Auth Profile (/api/auth/me) ---');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('Get Profile status:', meRes.status);
    console.log('Profile User Name:', meData.user?.name);
    if (meRes.status !== 200 || meData.user?.email !== testUserEmail) {
      throw new Error('Profile retrieval failed.');
    }

    console.log('\n--- 5. Testing Internships Listing ---');
    const internRes = await fetch(`${BASE_URL}/api/internships?search=Vercel`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const internData = await internRes.json();
    console.log('List Internships status:', internRes.status);
    console.log('Found internships matching "Vercel":', internData.internships?.length);
    if (internRes.status !== 200 || !Array.isArray(internData.internships)) {
      throw new Error('Internship listing query failed.');
    }

    console.log('\n--- 6. Testing Apply to Internship (intern-001) ---');
    const applyRes = await fetch(`${BASE_URL}/api/internships/intern-001/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const applyData = await applyRes.json();
    console.log('Apply status:', applyRes.status);
    console.log('Apply message:', applyData.message);
    if (applyRes.status !== 200) {
      throw new Error('Applying to internship failed.');
    }

    console.log('\n--- 7. Testing Save Internship (intern-002) ---');
    const saveRes = await fetch(`${BASE_URL}/api/internships/intern-002/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const saveData = await saveRes.json();
    console.log('Save status:', saveRes.status);
    console.log('Save message:', saveData.message);
    if (saveRes.status !== 200) {
      throw new Error('Saving internship failed.');
    }

    console.log('\n--- 8. Testing Dashboard Stats ---');
    const statsRes = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    console.log('Dashboard Stats status:', statsRes.status);
    console.log('Stats values:', statsData.stats);
    if (statsRes.status !== 200 || parseInt(statsData.stats.appliedCount) !== 1) {
      throw new Error('Dashboard stats verification failed.');
    }

    console.log('\n--- 9. Testing AI Resume Generation ---');
    const resumeRes = await fetch(`${BASE_URL}/api/resume/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Anya Sharma',
        college: 'Indian Institute of Technology',
        degree: 'B.Tech in Computer Science',
        skills: 'React, Node.js, Express, JavaScript',
        projects: [
          { title: 'HireHub Mockup', role: 'Full Stack', description: 'Created API services' }
        ],
        achievements: ['Won hackathon 2026']
      })
    });
    const resumeData = await resumeRes.json();
    console.log('AI Resume status:', resumeRes.status);
    console.log('Generated Summary:', resumeData.analysis?.summary);
    if (resumeRes.status !== 200 || !resumeData.analysis?.summary) {
      throw new Error('AI resume studio verification failed.');
    }

    console.log('\n--- 10. Testing AI Career Copilot Chat ---');
    const chatRes = await fetch(`${BASE_URL}/api/copilot/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'How can I optimize my resume for a backend engineer role?'
      })
    });
    const chatData = await chatRes.json();
    console.log('Copilot Chat status:', chatRes.status);
    console.log('Copilot message snippet:', chatData.content?.substring(0, 100) + '...');
    if (chatRes.status !== 200 || !chatData.content) {
      throw new Error('AI Career Copilot chat verification failed.');
    }

    console.log('\n✅ ALL BACKEND TEST SUITES COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    // Terminate server process
    console.log('Shutting down test backend server...');
    serverProcess.kill('SIGINT');
  }
}

runTests();
