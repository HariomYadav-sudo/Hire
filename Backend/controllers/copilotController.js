import { GoogleGenAI } from '@google/genai';
import { findUserById } from '../db.js';

export async function chatCopilot(req, res) {
  try {
    const userId = req.user.id;
    const user = findUserById(userId);

    const { messages, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'A message string is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiText = '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        // Map messages history to Gemini SDK format
        const history = Array.isArray(messages) ? messages : [];
        const contents = history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        // Append the new incoming message
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        // Prepend system instructions
        const systemInstruction = `
You are "Career Copilot", an empathetic, intelligent, and highly knowledgeable career mentor for college students.
Your target is to help the student succeed in landing tech internships and software jobs.
Provide actionable, startup-style advice. Help with resume critiques, learning roadmaps, interview preparation, and job search strategies.
Current Student profile: Name is ${user?.name || 'Student'}, studying ${user?.degree || 'computer science'} at ${user?.college || 'university'}.
Active skills: ${(user?.skills || []).join(', ') || 'General engineering foundations'}.

Keep responses concise, warm, professional, and formatted nicely in markdown. Do not write extremely long paragraphs. Use lists/bullet points where helpful.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            systemInstruction: systemInstruction
          }
        });

        aiText = response.text ? response.text.trim() : '';
      } catch (geminiError) {
        console.error('Gemini Copilot API failed, using fallback:', geminiError.message);
      }
    }

    // High quality simulated AI Mentor responses if API Key is not set or failed
    if (!aiText) {
      const q = message.toLowerCase();

      // 1. Resume & ATS
      if (q.includes('resume') || q.includes('cv') || q.includes('summary') || q.includes('ats')) {
        aiText = `### 📝 Resume Optimization Tips
To optimize your resume for applicant tracking systems (ATS) and tech recruiters, I suggest focusing on these key areas:
1. **Focus on Impact:** Instead of writing "Responsible for building a login page", use: *"Engineered secure user authentication using JSON Web Tokens (JWT) and Bcrypt, improving security for over 500+ student users."*
2. **Include quantitative metrics:** Wherever possible, add stats (e.g., loaded 40% faster, resolved 5 bugs, reduced asset bundle size).
3. **Organize logically:** Place **Skills** near the top, followed by **Projects** (with GitHub links), and then **Education**.

*Would you like me to critique one of your projects or help you write a summary?*`;
      } 
      // 2. Frontend / React
      else if (q.includes('react') || q.includes('frontend') || q.includes('css') || q.includes('html') || q.includes('tailwind') || q.includes('nextjs')) {
        aiText = `### 🎨 Frontend Developer Roadmap
To stand out as a Frontend Developer Intern, here is the focus path I recommend:
1. **Core JS Foundations:** Make sure you are comfortable with async/await, array map/filter/reduce, and state management.
2. **React Depth:** Understand the virtual DOM, hook mechanics (\`useEffect\`, \`useMemo\`, custom hooks), and context API.
3. **Modern Styling & Build Tooling:** Get hands-on with TailwindCSS, responsive design (mobile-first layout), and Vite configuration.
4. **Build a Unique Project:** Build a SaaS dashboard mockup (like HireHub!) instead of a simple todo list.

*Do you want to practice mock interview questions on React hooks or state management?*`;
      } 
      // 3. Backend / Node
      else if (q.includes('node') || q.includes('backend') || q.includes('database') || q.includes('api') || q.includes('sql') || q.includes('express') || q.includes('mongodb') || q.includes('postgres')) {
        aiText = `### ⚙️ Backend Developer Roadmap
If you are aiming for Backend Engineering roles, prioritize these fundamentals:
1. **API Design Standards:** Build RESTful endpoints with proper HTTP status codes (200, 201, 400, 401, 500) and structured JSON error responses.
2. **Database Management:** Learn relational DBs (like PostgreSQL/SQLite) and write raw SQL queries, joins, and indexing structures.
3. **Security & Authentication:** Implement secure authentication protocols using hashed credentials (Bcrypt) and session validation (JWT).
4. **Cloud Infrastructure:** Try deploying your node servers to fly.io, render.com, or Vercel serverless functions.

*What project are you planning to build? I can help outline the database schema!*`;
      } 
      // 4. Python
      else if (q.includes('python') || q.includes('django') || q.includes('flask')) {
        aiText = `### 🐍 Python Developer Learning Path
Python is highly versatile. Here is the path to progress from basics to professional level:
1. **Syntax & OOP:** Master decorators, generators, list comprehensions, and Object-Oriented principles.
2. **Web Frameworks:** Build lightweight REST APIs with **Flask** or build standard enterprise backends using **Django**.
3. **Data & AI Track:** Practice NumPy, Pandas, Matplotlib, and scikit-learn for data manipulation, or call Gemini models utilizing Python SDKs.
4. **Project Idea:** Build an automated web scraper that saves job details into an SQLite database and reports them via email.

*What is your current level in Python? I can suggest specific exercises!*`;
      }
      // 5. Javascript / Typescript
      else if (q.includes('javascript') || q.includes('js') || q.includes('typescript') || q.includes('ts')) {
        aiText = `### ⚡ JS/TS Master Path
JavaScript and TypeScript are the backbone of modern web ecosystems. Focus on:
1. **Asynchronous JS:** Fully master Promises, Event Loop, Microtasks queue, and async/await error management.
2. **TypeScript Fundamentals:** Learn TS Interfaces, Type Aliases, Generics, and strict compiler settings (\`strictNullChecks\`).
3. **Frameworks Integration:** Integrate TypeScript inside React components to ensure strict prop-types validation.
4. **Node Runtime:** Understand event emitters, buffer streams, and writing commonJS vs ES Modules scripts.

*Would you like to solve a quick TypeScript generics challenge?*`;
      }
      // 6. Java
      else if (q.includes('java') || q.includes('spring')) {
        aiText = `### ☕ Java & Spring Learning Path
Java is the standard for robust enterprise backend pipelines.
1. **Language Core:** Master Multithreading, Garbage Collection mechanics, Collections framework, and Stream APIs.
2. **Spring Boot Framework:** Learn Dependency Injection, writing controllers, and integrating Spring Data JPA.
3. **Build Tooling:** Get familiar with configuring Maven or Gradle build scripts.
4. **System Project:** Architect a scalable library management backend using Spring Boot, PostgreSQL, and Spring Security token checks.

*Are you preparing for a Java-based enterprise interview?*`;
      }
      // 7. System Design
      else if (q.includes('system design') || q.includes('scalability') || q.includes('load balancer') || q.includes('microservice')) {
        aiText = `### 🏗️ Systems Design Core Concepts
For software design interviews, focus on these architecture building blocks:
1. **Load Balancing:** Understand routing algorithms (round-robin) to distribute client load across multiple servers.
2. **Caching:** Learn how to use Redis to cache heavy SQL database queries, and master eviction policies (LRU).
3. **Database Scaling:** Differentiate between SQL vs NoSQL, and understand sharding, replication, and master-slave setups.
4. **Asynchronous Processing:** Master messaging queues (RabbitMQ/Kafka) to decouple slow background tasks.

*Let me know if you want to design a real-world service (e.g. TinyURL or Twitter)!*`;
      }
      // 8. Project Ideas
      else if (q.includes('project') || q.includes('build') || q.includes('portfolio') || q.includes('idea')) {
        aiText = `### 💡 Portfolio Project Ideas
To impress SaaS recruiters, build one of these advanced projects instead of simple todo lists:
1. **Real-time Collaboration Canvas:** Build a whiteboard sharing tool utilizing React, WebSockets, and Node.js.
2. **ATS Resume Parser API:** Create a Node/Express API that receives resume uploads, extracts keywords, and highlights missing skills.
3. **Cloud Developer Hub:** Build a dockerized container orchestrator dashboard showcasing cpu/memory logs.
4. **E-Commerce Backend Pipeline:** Write a REST API with Stripe payments processing, transaction rollback database logs, and JWT tokens.

*Which option appeals to you? I can help outline the database schema!*`;
      }
      // 9. Outreach & LinkedIn
      else if (q.includes('outreach') || q.includes('linkedin') || q.includes('email') || q.includes('recruiter') || q.includes('message')) {
        aiText = `### ✉️ Recruiter Outreach Template
Here is a high-yield, copy-pasteable message template to send to tech recruiters or engineering managers:

> *"Hi [Name],\n\nI saw your team is building [Feature/Product]. I recently built a modern [Name of Project] using React, Node.js, and Express, optimizing load times by 30%. I’d love to know what skills your team values most for upcoming developer internships.\n\nHere is my portfolio: [Link]\n\nBest,\n[Your Name]"*

**Key Tips:** Keep it under 100 words, link your portfolio/github, and focus on *their* product.`;
      }
      // 10. Salary & Offers
      else if (q.includes('salary') || q.includes('offer') || q.includes('negotiate')) {
        aiText = `### 💰 Salary Negotiation Tactics
Getting an offer is just the start. Use these scripts to maximize your compensation:
1. **Stay polite but firm:** *"I am incredibly excited about the role. Given my technical skills in React and Node and past project accomplishments, I was hoping we could explore a base salary closer to [Target]."*
2. **Leverage alternative offers:** *"I have another active offer at [Company], but HireHub is my top choice. If we can reach [Target], I am ready to sign today."*
3. **Negotiate non-cash perks:** If budget is tight, ask for remote flexibility, learning budgets, or performance bonuses.

*Do you have an active offer you are preparing to negotiate?*`;
      }
      // 11. Interview Prep / DSA
      else if (q.includes('interview') || q.includes('prep') || q.includes('dsa') || q.includes('leetcode') || q.includes('algorithms') || q.includes('mock')) {
        aiText = `### 🤝 Tech Interview Prep Checklist
Here is a structured game plan to prepare for your next technical interview:
1. **Behavioral Questions (STAR Method):** Prepare stories for scenarios like: *'Tell me about a time you solved a technical blocker'* or *'How did you handle a teammate disagreement?'*
2. **Core Data Structures:** Practice Array, Map, Set, and Binary Search algorithms. Focus on time and space complexity (Big O).
3. **API & System Design:** Be ready to draw a database diagram and explain how your frontend communicates with the backend endpoints.
4. **Do Mock Interviews:** Record yourself answering coding problems out loud. Explain *why* you choose a particular approach.

*Let me know what role you are interviewing for, and we can run a mock coding or behavioral drill right now!*`;
      } 
      // 12. Internship search
      else if (q.includes('internship') || q.includes('job') || q.includes('apply') || q.includes('find')) {
        aiText = `### 🔍 Internship Search Strategy
Job boards can be noisy. Here is a high-yield method to find relevant internships:
1. **Leverage Warm Outreach:** Find engineers or hiring managers on LinkedIn at companies you like. Send a message like: *"Hi [Name], I saw your team built X. I recently built a similar project utilizing React/Node. I'd love to know what skills your team values most for internships."*
2. **Create a Standout Portfolio:** One highly polished, deployed application is worth 10 half-completed projects.
3. **Keep Applying Regularly:** Treat internship search as a weekly routine. Keep tracking your status inside your HireHub dashboard.

*Would you like me to write a custom LinkedIn outreach template for you?*`;
      } 
      // 13. Advanced Dynamic Sentence Parser Fallback
      else {
        // Attempt to extract key words to make it feel like real AI
        const words = q.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(w => w.length > 3);
        const exclusions = ['what', 'when', 'where', 'should', 'about', 'would', 'could', 'their', 'there', 'hello', 'please', 'thanks', 'career'];
        const nouns = words.filter(w => !exclusions.includes(w));
        
        const mainSubject = nouns.length > 0 ? nouns[nouns.length - 1] : '';

        if (mainSubject) {
          aiText = `### 💡 Learning about "${mainSubject.charAt(0).toUpperCase() + mainSubject.slice(1)}"
That is an excellent career query! Regarding your interest or question about **${mainSubject}**, here is a structured way to approach it:

1. **Research Core Concepts:** Fully understand the underlying problems **${mainSubject}** solves.
2. **Hands-on Integration:** Build a mini-project focusing solely on **${mainSubject}** (e.g. creating a GitHub repo, config scripts, or API endpoints).
3. **Document Your Learning:** Write a brief README detailing your findings to showcase on LinkedIn.
4. **Match with Internships:** Search for positions listing **${mainSubject}** in their skill specifications.

*(Tip: To get highly custom generative responses to any question, edit your \`Backend/.env\` file to insert your real \`GEMINI_API_KEY\`!)*

*Would you like me to suggest a specific project roadmap utilizing ${mainSubject}?*`;
        } else {
          aiText = `Hello ${user?.name || 'there'}! I am your **AI Career Copilot**. 🚀

I am ready to help you with:
- **Resume Reviews:** Suggesting professional summary improvements and missing technical keywords.
- **Developer Roadmaps:** Helping you map out your frontend, backend, or cloud learning path.
- **Interview Drills:** Simulating technical questions, API schema design, and coding problems.
- **Search Tactics:** Tips on networking, portfolios, and applying.

*(Tip: To get fully generative custom answers, edit your \`Backend/.env\` file to insert your real \`GEMINI_API_KEY\`!)*

*Tell me what you are working on, or ask me any career/interview question!*`;
        }
      }
    }

    return res.status(200).json({
      role: 'assistant',
      content: aiText,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Career Copilot Error:', error);
    return res.status(500).json({ message: 'Internal server error during chat processing.' });
  }
}
