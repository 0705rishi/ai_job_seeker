import mongoose from "mongoose";
import bcrypt from "bcrypt";
import env from "../config/env";
import User from "../models/user.model";
import Job from "../models/job.model";
import SeekerProfile from "../models/profile.model";
import { getEmbedding } from "../services/ai/gemini.service";

const jobsData: any[] = [
  {
    title: "Junior Frontend Developer",
    company: "PixelPerfect Web",
    description: "Looking for a passionate junior frontend developer to craft beautiful, responsive user interfaces. You will work closely with design teams to bring layouts to life.",
    requirements: ["Build responsive web layouts", "Integrate REST APIs", "Collaborate on UI design components"],
    skills: ["React", "JavaScript", "HTML", "CSS", "Tailwind"],
    location: "Bengaluru",
    workMode: "hybrid" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "React Developer",
    company: "SaaSify Systems",
    description: "Join our core application team to scale our SaaS dashboards. Heavy emphasis on React state management, hooks, and component lifecycles.",
    requirements: ["Manage complex state in React", "Optimize web app performance", "Write clean reusable components"],
    skills: ["React", "TypeScript", "Redux", "Zustand", "Vite"],
    location: "Mumbai",
    workMode: "remote" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "Backend Development Intern",
    company: "NodeFlow Systems",
    description: "Great opportunity for freshers to learn backend engineering at scale. You will help build and document Express REST APIs, manage MongoDB connections, and learn git workflows.",
    requirements: ["Write Node.js scripts", "Design basic MongoDB schemas", "Participate in code reviews"],
    skills: ["Node", "Express", "MongoDB", "JavaScript", "Git"],
    location: "Pune",
    workMode: "onsite" as const,
    type: "internship" as const,
    source: "internal" as const,
  },
  {
    title: "Python Software Engineer",
    company: "DataSpark AI",
    description: "We are seeking a Python engineer to work on our backend scraping pipelines and data cleaning systems. Familiarity with AI tools is a plus.",
    requirements: ["Develop scraping tools", "Write database SQL queries", "Clean unstructured dataset inputs"],
    skills: ["Python", "Django", "Flask", "SQL", "Pandas"],
    location: "Hyderabad",
    workMode: "remote" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "Java Developer (Spring Boot)",
    company: "Enterprise Corp",
    description: "Seeking a junior Java developer to write backend REST endpoints, debug Hibernate queries, and maintain microservices structures.",
    requirements: ["Develop Java services", "Write unit tests", "Understand relational databases"],
    skills: ["Java", "Spring", "SQL", "Git", "Maven"],
    location: "Chennai",
    workMode: "onsite" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "Full Stack Developer",
    company: "AppLaunch Labs",
    description: "Looking for a full stack engineer to build features end-to-end. You will work on both the React frontend and Node backend.",
    requirements: ["Build features end-to-end", "Integrate databases and third-party APIs", "Deploy apps to cloud hostings"],
    skills: ["React", "Node", "TypeScript", "MongoDB", "Express", "Tailwind"],
    location: "Bengaluru",
    workMode: "remote" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "Mobile App Developer (Flutter)",
    company: "GoMobile Solutions",
    description: "Build cross-platform mobile apps for Android and iOS using Flutter. Experience with state management is required.",
    requirements: ["Develop clean mobile UIs", "Manage app state", "Publish to App Stores"],
    skills: ["Flutter", "Dart", "Git", "REST", "API"],
    location: "Noida",
    workMode: "hybrid" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "Cloud Infrastructure Associate",
    company: "CloudFlow Ops",
    description: "Learn cloud management and DevOps pipelines. Assist in configuring AWS resources and setting up CI/CD workflows.",
    requirements: ["Configure cloud resources", "Manage Linux environments", "Write basic bash scripts"],
    skills: ["AWS", "Docker", "Linux", "Bash", "Git"],
    location: "Bengaluru",
    workMode: "onsite" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "UI/UX Designer & Frontend Web",
    company: "DesignHub Studio",
    description: "A hybrid role for someone with an eye for UI design and HTML/CSS chops. Translate Figma wireframes into responsive web code.",
    requirements: ["Design wireframes in Figma", "Convert designs to HTML/CSS", "Optimize layouts for mobile"],
    skills: ["Figma", "HTML", "CSS", "Tailwind", "JavaScript"],
    location: "Mumbai",
    workMode: "hybrid" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "AI/ML Engineer Graduate Trainee",
    company: "Apex Intelligent Services",
    description: "Enter the world of AI with us. Train and fine-tune models, evaluate model outputs, and work on natural language tasks.",
    requirements: ["Fine-tune simple ML models", "Process textual dataset inputs", "Evaluate machine learning performance"],
    skills: ["Python", "Tensorflow", "Pytorch", "AI", "Machine Learning"],
    location: "Hyderabad",
    workMode: "remote" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "Associate Software Engineer",
    company: "TechGiant Global",
    description: "Our graduate engineering program. We train you on full-stack web architectures, agile methodologies, and enterprise standards.",
    requirements: ["Learn enterprise tech stack", "Solve algorithmic challenges", "Collaborate in Agile teams"],
    skills: ["Java", "JavaScript", "SQL", "Git", "HTML"],
    location: "Pune",
    workMode: "onsite" as const,
    type: "full-time" as const,
    source: "internal" as const,
  },
  {
    title: "Web Developer (WordPress / Shopify)",
    company: "LaunchPad Agency",
    description: "Build custom templates and layouts for e-commerce and portfolio client sites. Familiarity with styling libraries is key.",
    requirements: ["Customize WordPress/Shopify themes", "Write clean CSS layouts", "Ensure fast web load speeds"],
    skills: ["HTML", "CSS", "JavaScript", "PHP", "Sass"],
    location: "Goa",
    workMode: "remote" as const,
    type: "contract" as const,
    source: "internal" as const,
  },
  // Adding external jobs
  {
    title: "Software Engineer (External Listing)",
    company: "Google",
    description: "Software engineering role at Google. Build scalable, high-availability services and solve complex systems challenges.",
    requirements: ["Expertise in data structures", "Scale backend architectures", "Collaborate on global projects"],
    skills: ["Go", "C++", "Python", "Kubernetes", "Linux"],
    location: "Bengaluru",
    workMode: "onsite" as const,
    type: "full-time" as const,
    source: "external" as const,
    externalUrl: "https://careers.google.com/jobs",
  },
  {
    title: "Frontend Developer (External Link)",
    company: "Meta",
    description: "Work on user-facing products at Meta scale. Optimize React rendering and build responsive product pages.",
    requirements: ["Deep understanding of React", "Optimize client-side render performance", "Scale UI architectures"],
    skills: ["React", "JavaScript", "TypeScript", "CSS", "HTML"],
    location: "Hyderabad",
    workMode: "hybrid" as const,
    type: "full-time" as const,
    source: "external" as const,
    externalUrl: "https://www.metacareers.com",
  }
];

// Let's generate another 16 jobs to reach 30 jobs
for (let i = 15; i <= 30; i++) {
  const isEven = i % 2 === 0;
  const isThree = i % 3 === 0;
  
  jobsData.push({
    title: isEven ? `Software Development Engineer ${i}` : `Associate QA Engineer ${i}`,
    company: isThree ? "Innova Technologies" : "Alpha Web Systems",
    description: `A fantastic opportunity to join our growing development division as a junior staff member. You will build and test modules for our enterprise client dashboard.`,
    requirements: [
      "Write automated unit tests",
      "Debug system level issues",
      "Collaborate in cross-functional squads"
    ],
    skills: isEven 
      ? ["JavaScript", "Node", "Express", "MongoDB", "Git"] 
      : ["JavaScript", "HTML", "CSS", "Jest", "Cypress"],
    location: isThree ? "Bengaluru" : "Gurugram",
    workMode: isEven ? ("remote" as const) : ("onsite" as const),
    type: isThree ? ("internship" as const) : ("full-time" as const),
    source: "internal" as const,
  });
}

export const seedDB = async () => {
  try {
    console.log("🚀 Starting database seeding...");
    await mongoose.connect(env.MONGODB_URI);
    console.log("📡 Connected to MongoDB for seeding.");

    // 1. Clear database collections
    await User.deleteMany({});
    await Job.deleteMany({});
    await SeekerProfile.deleteMany({});
    console.log("🧹 Cleared User, Job, and Profile collections.");

    // 2. Create standard Recruiter demo account
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const recruiterUser = await User.create({
      name: "Tony Stark",
      email: "recruiter@example.com",
      passwordHash,
      role: "recruiter",
      verified: true,
    });
    console.log("👤 Created Recruiter account: recruiter@example.com");

    // Create standard Seeker demo account
    const seekerUser = await User.create({
      name: "Priya Patel",
      email: "seeker@example.com",
      passwordHash,
      role: "seeker",
      verified: true,
    });
    console.log("👤 Created Seeker account: seeker@example.com");

    // 3. Pre-create Seeker Profile with 100% completeness
    const profileText = `
      Skills: React, Node, TypeScript, MongoDB, Express, Html, Css, Tailwind, Python, Git
      Experience: Software Development Intern at InnovateTech Solutions for 6 months. Developed frontend user dashboard components using React and helped refactor legacy CSS to modern Tailwind code.
      Projects: E-Commerce Web Application: Full-stack e-commerce marketplace featuring product catalog, shopping cart, and mock payment gateway integration. Tech: React, Node.js, Express, MongoDB
      Preferences: Roles: Frontend Developer, Software Engineer; Locations: Bengaluru, Mumbai; Work Mode: remote
    `;
    const seekerEmbedding = await getEmbedding(profileText);

    await SeekerProfile.create({
      userId: seekerUser._id,
      education: [
        {
          degree: "B.Tech Computer Science",
          institution: "Indian Institute of Technology (IIT)",
          year: 2025,
        }
      ],
      skills: ["React", "Node", "TypeScript", "MongoDB", "Express", "HTML", "CSS", "Tailwind", "Python", "Git"],
      projects: [
        {
          title: "E-Commerce Web Application",
          description: "Full-stack e-commerce marketplace featuring product catalog, shopping cart, and mock payment gateway integration.",
          tech: ["React", "Node.js", "Express", "MongoDB"],
        }
      ],
      experience: [
        {
          role: "Software Development Intern",
          org: "InnovateTech Solutions",
          durationMonths: 6,
          summary: "Developed frontend user dashboard components using React and helped refactor legacy CSS to modern Tailwind code.",
        }
      ],
      preferences: {
        roles: ["Frontend Developer", "Software Engineer"],
        locations: ["Bengaluru", "Mumbai"],
        workMode: "remote",
      },
      resumeUrl: "/uploads/resumes/1781792066388_sample_resume.txt",
      resumeText: "Sample resume text extracted",
      completeness: 100,
      embedding: seekerEmbedding,
    });
    console.log("📋 Pre-seeded Seeker Profile for seeker@example.com (100% complete)");

    // 4. Seed job postings with embeddings
    console.log(`💼 Seeding ${jobsData.length} job postings...`);
    
    for (const jobItem of jobsData) {
      const jobText = `
        Title: ${jobItem.title}
        Company: ${jobItem.company}
        Description: ${jobItem.description}
        Requirements: ${jobItem.requirements.join(", ")}
        Skills: ${jobItem.skills.join(", ")}
        Location: ${jobItem.location}
        Work Mode: ${jobItem.workMode}
      `;
      const embedding = await getEmbedding(jobText);

      await Job.create({
        ...jobItem,
        recruiterId: recruiterUser._id,
        embedding,
        status: "active",
      });
    }

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// If run directly
if (require.main === module) {
  seedDB();
}
