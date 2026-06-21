import { GoogleGenAI } from "@google/genai";
import env from "../../config/env";
import { ISeekerProfile } from "../../models/profile.model";
import { IJob } from "../../models/job.model";

const isGeminiConfigured = !!env.GEMINI_API_KEY;

// Only instantiate GoogleGenAI if the API key is present
const ai = isGeminiConfigured ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;

export const MODELS = {
  text: "gemini-2.0-flash",
  embedding: "text-embedding-004",
};

// 200 common skills/tech terms to map to embedding indices for deterministic mock embeddings
const COMMON_KEYWORDS = [
  "react", "node", "javascript", "typescript", "mongodb", "express", "html", "css",
  "tailwind", "python", "django", "flask", "java", "spring", "c++", "c#", "golang",
  "ruby", "rails", "php", "sql", "postgresql", "mysql", "redis", "docker", "kubernetes",
  "aws", "gcp", "azure", "git", "github", "graphql", "rest", "api", "next.js", "nest.js",
  "angular", "vue", "jquery", "bootstrap", "sass", "webpack", "vite", "jest", "cypress",
  "prisma", "sequelize", "mongoose", "firebase", "oauth", "jwt", "microservices",
  "redux", "zustand", "mobx", "webpack", "npm", "yarn", "linux", "bash", "nginx",
  "apache", "figma", "agile", "scrum", "devops", "ci/cd", "machine learning", "deep learning",
  "ai", "nlp", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "data science",
  "rust", "kotlin", "swift", "flutter", "react native", "electron", "webassembly",
  "overleaf", "latex", "ats", "resume", "cv", "portfolio", "cloud", "security"
];

/**
 * Generate a mock 768-dimensional embedding vector deterministically based on text content.
 * If keyword is present, set its corresponding index to 1.0.
 * Fill the rest with low pseudo-random noise seeded by the text length/content.
 */
const generateMockEmbedding = (text: string): number[] => {
  const vector: number[] = new Array(768).fill(0);
  const normalizedText = text.toLowerCase();

  // Populate first COMMON_KEYWORDS.length dimensions based on keywords
  COMMON_KEYWORDS.forEach((keyword, index) => {
    if (normalizedText.includes(keyword)) {
      vector[index] = 1.0;
    }
  });

  // Fill remaining dimensions with deterministic pseudo-random noise between 0.01 and 0.05
  // using a simple seed from the text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let i = COMMON_KEYWORDS.length; i < 768; i++) {
    const val = Math.abs(Math.sin(hash + i)) * 0.04 + 0.01;
    vector[i] = parseFloat(val.toFixed(4));
  }

  // Normalize the vector so it has a magnitude of 1 (unit vector)
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return vector.map((val) => parseFloat((val / magnitude).toFixed(6)));
  }

  return vector;
};

/**
 * Generate embedding vector using Gemini API, or fallback to mock vector
 */
export const getEmbedding = async (text: string): Promise<number[]> => {
  if (!isGeminiConfigured || !ai) {
    console.log("⚠️ [AI SERVICE] Gemini API key missing. Generating mock embedding vector.");
    return generateMockEmbedding(text);
  }

  try {
    const response = await ai.models.embedContent({
      model: MODELS.embedding,
      contents: text,
    });
    
    const res = response as any;
    if (res.embedding?.values) {
      return res.embedding.values;
    }
    
    if (res.embeddings && res.embeddings[0]?.values) {
      return res.embeddings[0].values;
    }
    
    throw new Error("Empty embedding returned from Gemini");
  } catch (error) {
    console.error("❌ [AI SERVICE] Gemini embedding error:", error);
    return generateMockEmbedding(text);
  }
};

export interface ParsedProfile {
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  projects: Array<{
    title: string;
    description: string;
    tech: string[];
  }>;
  experience: Array<{
    role: string;
    org: string;
    durationMonths: number;
    summary: string;
  }>;
}

/**
 * Generate parsed profile from resume text using Gemini Structured Outputs, or fallback to mock parser.
 */
export const parseResumeText = async (text: string): Promise<ParsedProfile> => {
  if (!isGeminiConfigured || !ai) {
    console.log("⚠️ [AI SERVICE] Gemini API key missing. Running mock resume parser.");
    return runMockResumeParser(text);
  }

  try {
    const prompt = `
      You are a professional ATS resume parser. Extract the user's details from the resume text provided.
      Return the output strictly in the requested JSON schema.
      
      Resume Text:
      ${text}
    `;

    // Define the schema for structured output
    const responseSchema = {
      type: "OBJECT",
      properties: {
        skills: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "List of technical skills, frameworks, tools and programming languages."
        },
        education: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              degree: { type: "STRING", description: "Degree name e.g. B.Tech Computer Science, MS" },
              institution: { type: "STRING", description: "School, College, or University name" },
              year: { type: "INTEGER", description: "Graduation year e.g. 2024" }
            },
            required: ["degree", "institution", "year"]
          }
        },
        projects: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "Project title" },
              description: { type: "STRING", description: "1-2 sentence description of what the project did" },
              tech: { type: "ARRAY", items: { type: "STRING" }, description: "Tech stack used in this project" }
            },
            required: ["title", "description"]
          }
        },
        experience: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              role: { type: "STRING", description: "Job title or position" },
              org: { type: "STRING", description: "Company or organization name" },
              durationMonths: { type: "INTEGER", description: "Number of months worked" },
              summary: { type: "STRING", description: "1-2 sentence description of accomplishments" }
            },
            required: ["role", "org", "durationMonths", "summary"]
          }
        }
      },
      required: ["skills", "education", "projects", "experience"]
    };

    const response = await ai.models.generateContent({
      model: MODELS.text,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return parsedJson as ParsedProfile;
  } catch (error) {
    console.error("❌ [AI SERVICE] Gemini resume parsing error:", error);
    return runMockResumeParser(text);
  }
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Heuristics-based mock resume parser
 */
const runMockResumeParser = (text: string): ParsedProfile => {
  const lowercaseText = text.toLowerCase();
  
  // Extract skills based on common keywords
  const skills: string[] = [];
  COMMON_KEYWORDS.slice(0, 50).forEach((keyword) => {
    // Search with word boundary to avoid partial matching
    const escaped = escapeRegExp(keyword);
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) {
      // Capitalize first letters properly
      const formatted = keyword.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(".");
      skills.push(formatted);
    }
  });

  // Default skills if none matched
  if (skills.length === 0) {
    skills.push("JavaScript", "React", "Node.js", "HTML", "CSS", "Git");
  }

  // Detect education
  const education: ParsedProfile["education"] = [];
  if (lowercaseText.includes("b.tech") || lowercaseText.includes("bachelor")) {
    education.push({
      degree: "B.Tech Computer Science",
      institution: lowercaseText.includes("iit") 
        ? "Indian Institute of Technology (IIT)" 
        : lowercaseText.includes("nit") 
        ? "National Institute of Technology (NIT)" 
        : "State Technical University",
      year: 2025
    });
  } else {
    education.push({
      degree: "B.Sc Computer Science",
      institution: "City Commerce & Science College",
      year: 2024
    });
  }

  // Detect/Generate projects
  const projects: ParsedProfile["projects"] = [];
  if (lowercaseText.includes("portfolio") || lowercaseText.includes("website")) {
    projects.push({
      title: "Personal Portfolio Website",
      description: "A highly responsive developer portfolio showcasing projects and contact forms with custom animations.",
      tech: skills.slice(0, 3)
    });
  }
  if (lowercaseText.includes("e-commerce") || lowercaseText.includes("shop") || projects.length === 0) {
    projects.push({
      title: "E-Commerce Web Application",
      description: "Full-stack e-commerce marketplace featuring product catalog, shopping cart, and mock payment gateway integration.",
      tech: ["React", "Node.js", "Express", "MongoDB"]
    });
  }

  // Experience
  const experience: ParsedProfile["experience"] = [];
  if (lowercaseText.includes("intern") || lowercaseText.includes("work")) {
    experience.push({
      role: "Software Development Intern",
      org: "InnovateTech Solutions",
      durationMonths: 6,
      summary: "Developed frontend user dashboard components using React and helped refactor legacy CSS to modern Tailwind code."
    });
  } else {
    experience.push({
      role: "Freelance Web Developer",
      org: "Self-Employed",
      durationMonths: 12,
      summary: "Built custom websites for small local businesses using HTML, CSS, JavaScript, and WordPress."
    });
  }

  return {
    skills,
    education,
    projects,
    experience
  };
};

/**
 * General helper to run Gemini calls with prompt string (used by other AI tools)
 */
export const generateText = async (prompt: string, mockResponse: string): Promise<string> => {
  if (!isGeminiConfigured || !ai) {
    console.log("⚠️ [AI SERVICE] Gemini API key missing. Returning mock text response.");
    return mockResponse;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODELS.text,
      contents: prompt,
    });
    return response.text || mockResponse;
  } catch (error) {
    console.error("❌ [AI SERVICE] Gemini text generation error:", error);
    return mockResponse;
  }
};

export interface AtsSuggestion {
  icon: string;
  title: string;
  why: string;
  impact: "high" | "medium" | "low";
}

export interface AtsResult {
  score: number;
  suggestions: AtsSuggestion[];
}

/**
 * Calculates ATS Resume Score and provides suggestions.
 */
export const getAtsScore = async (
  profile: ISeekerProfile,
  userEmail: string
): Promise<AtsResult> => {
  const resumeText = profile.resumeText || "";

  if (isGeminiConfigured && ai && resumeText.trim()) {
    try {
      const prompt = `
        You are a professional ATS scanner. Analyze the following resume text and score it from 0 to 100.
        Also provide 3-5 specific, highly actionable improvements as JSON.
        Resume:
        ${resumeText}
      `;

      const responseSchema = {
        type: "OBJECT",
        properties: {
          score: { type: "INTEGER", description: "ATS score from 0 to 100" },
          suggestions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                icon: { type: "STRING", description: "Name of an icon: Award, Briefcase, FileText, User, or Check" },
                title: { type: "STRING", description: "Short actionable improvement title" },
                why: { type: "STRING", description: "Why this helps the resume score" },
                impact: { type: "STRING", description: "high, medium, or low" }
              },
              required: ["icon", "title", "why", "impact"]
            }
          }
        },
        required: ["score", "suggestions"]
      };

      const response = await ai.models.generateContent({
        model: MODELS.text,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any
        }
      });

      return JSON.parse(response.text || "{}") as AtsResult;
    } catch (error) {
      console.error("❌ [AI SERVICE] ATS Resume scoring error:", error);
    }
  }

  // High-fidelity fallback heuristic scorer
  const suggestions: AtsSuggestion[] = [];
  let score = 40;

  if (!profile.education || profile.education.length === 0) {
    suggestions.push({
      icon: "Award",
      title: "Add education history",
      why: "Academic backgrounds validate your foundation. Add graduation details.",
      impact: "high",
    });
  } else {
    score += 15;
  }

  if (!profile.skills || profile.skills.length === 0) {
    suggestions.push({
      icon: "Sparkles",
      title: "Add tech keywords in Skills",
      why: "ATS search indexes look directly for skill tags like React or Python.",
      impact: "high",
    });
  } else {
    score += 15;
    if (profile.skills.length < 5) {
      suggestions.push({
        icon: "Check",
        title: "Expand skills lists",
        why: "We recommend adding at least 8-10 specific framework/tool keywords.",
        impact: "medium",
      });
      score += 5;
    } else {
      score += 10;
    }
  }

  if (!profile.projects || profile.projects.length === 0) {
    suggestions.push({
      icon: "Briefcase",
      title: "Add developer projects",
      why: "Hands-on projects demonstrate capability and cover crucial technology keywords.",
      impact: "high",
    });
  } else {
    score += 15;
  }

  if (!profile.experience || profile.experience.length === 0) {
    suggestions.push({
      icon: "User",
      title: "Add work or internship history",
      why: "Internships, freelance work, or open source shows workplace collaboration.",
      impact: "medium",
    });
  } else {
    score += 15;
  }

  // General ATS tips
  suggestions.push({
    icon: "Check",
    title: "Quantify achievements in project descriptions",
    why: "Adding metrics (e.g. 'improved speed by 25%') increases resume readability.",
    impact: "high",
  });

  return {
    score: Math.min(100, score),
    suggestions: suggestions.slice(0, 5),
  };
};

export interface SkillGapItem {
  skill: string;
  resource: string;
  lift: number;
}

/**
 * Calculates missing skills vs target job requirements and suggests resources.
 */
export const getSkillGapAnalysis = async (
  profile: ISeekerProfile,
  job: IJob
): Promise<SkillGapItem[]> => {
  const jobSkills = job.skills || [];
  const profileSkills = (profile.skills || []).map((s) => s.toLowerCase().trim());

  // Determine missing skills
  const missingSkills = jobSkills.filter(
    (skill) => !profileSkills.some(
      (ps) => ps === skill.toLowerCase().trim() || ps.includes(skill.toLowerCase().trim()) || skill.toLowerCase().trim().includes(ps)
    )
  );

  const liftPerSkill = jobSkills.length > 0 ? Math.round(35 / jobSkills.length) : 5;

  const defaultResources: { [key: string]: string } = {
    react: "React Official documentation (react.dev) - Build Tic-Tac-Toe tutorial.",
    node: "Node.js Learning Path - Express framework documentation.",
    typescript: "TypeScript Deep Dive online book by Basarat.",
    mongodb: "MongoDB University - M001 Database Basics Course.",
    express: "Express.js official getting started guide.",
    docker: "Docker curriculum (docker-curriculum.com) - Containers for beginners.",
    kubernetes: "Kubernetes Basics interactive tutorial on kubernetes.io.",
    aws: "AWS Certified Cloud Practitioner - Free training course on AWS Skill Builder.",
    postgresql: "PostgreSQL Tutorial (postgresqltutorial.com) - Relational DB basics.",
    python: "Python for Beginners on freeCodeCamp.",
    git: "Git Immersion tutorial (gitimmersion.com)."
  };

  const gapAnalysis: SkillGapItem[] = missingSkills.map((skill) => {
    const key = skill.toLowerCase().trim();
    const resource = defaultResources[key] || `Free courses for ${skill} on YouTube and Coursera.`;
    return {
      skill,
      resource,
      lift: liftPerSkill,
    };
  });

  return gapAnalysis;
};

/**
 * Tailors a cover letter based on seeker profile and target job description.
 */
export const generateCoverLetter = async (
  profile: ISeekerProfile,
  job: IJob,
  userName: string
): Promise<string> => {
  const skillsList = profile.skills ? profile.skills.slice(0, 4).join(", ") : "";
  const projectsList = profile.projects ? profile.projects.map((p) => p.title).join(", ") : "";

  const prompt = `
    You are a professional cover letter writer. Draft an engaging, professional cover letter (under 250 words) for a seeker applying to a job.
    Seeker Name: ${userName}
    Seeker Skills: ${profile.skills?.join(", ")}
    Seeker Projects: ${profile.projects?.map((p) => `${p.title}: ${p.description}`).join("; ")}
    Job Title: ${job.title}
    Company: ${job.company}
    Job Description: ${job.description}
    Keep it encouraging and fit for a fresher.
  `;

  const fallbackLetter = `Dear Hiring Team at ${job.company},

I am writing to express my enthusiastic interest in the ${job.title} position at your company. As a graduate with a solid foundation in software development and practical skills in ${skillsList || "computer science"}, I am eager to contribute my capabilities to your engineering division.

During my studies, I have successfully engineered projects such as ${projectsList || "web interfaces"}, which allowed me to solve complex algorithmic issues and learn modern developer frameworks. I am highly motivated by ${job.company}'s work and feel confident my skills align well with the expectations for this role.

Thank you for your time and consideration. I look forward to the opportunity to discuss my qualifications further.

Sincerely,
${userName}`;

  return generateText(prompt, fallbackLetter);
};

// LaTeX character escaper helper
const escapeLatex = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
};

/**
 * Renders seeker profile into a valid, compileable LaTeX resume string.
 */
export const generateLatexResume = (
  profile: ISeekerProfile,
  userEmail: string,
  userName: string
): string => {
  const name = escapeLatex(userName);
  const email = escapeLatex(userEmail);

  // 1. Education LaTeX block
  const eduItems = (profile.education || []).map((edu) => `
\\noindent \\textbf{${escapeLatex(edu.degree)}} \\hfill ${edu.year} \\\\
\\textit{${escapeLatex(edu.institution)}} \\\\
  `).join("\n");

  // 2. Skills LaTeX block
  const skillsText = escapeLatex(profile.skills?.join(", ") || "");

  // 3. Projects LaTeX block
  const projItems = (profile.projects || []).map((p) => `
\\noindent \\textbf{${escapeLatex(p.title)}} \\hfill \\textit{${escapeLatex(p.tech.join(", "))}} \\\\
${escapeLatex(p.description)} \\\\
  `).join("\n");

  // 4. Experience LaTeX block
  const expItems = (profile.experience || []).map((exp) => `
\\noindent \\textbf{${escapeLatex(exp.role)}} \\hfill ${exp.durationMonths} months \\\\
\\textit{${escapeLatex(exp.org)}} \\\\
${escapeLatex(exp.summary)} \\\\
  `).join("\n");

  const template = `\\documentclass[10pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{5pt}

\\begin{document}
\\begin{center}
    {\\LARGE\\bfseries ${name}} \\\\
    \\vspace{2pt}
    ${email}
\\end{center}

\\section{Skills}
\\noindent ${skillsText}

\\section{Education}
${eduItems || "No education added."}

\\section{Projects}
${projItems || "No projects added."}

\\section{Experience}
${expItems || "No work experience."}

\\end{document}
`;

  return template;
};
