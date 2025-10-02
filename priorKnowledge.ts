export type PriorKnowledge = {
  name: string;
  role: string;
  expertise: string[];
  background: string;
};

export const priorKnowledgeProfiles: Record<string, PriorKnowledge> = {
  beginner: {
    name: "Alex",
    role: "Computer Science Student",
    expertise: [
      "Basic HTML and CSS",
      "Python fundamentals",
      "Basic algorithms and data structures",
    ],
    background: "First-year university student with minimal web development experience. Comfortable with programming basics but new to modern web frameworks and advanced concepts.",
  },
  
  frontend: {
    name: "Jordan",
    role: "Frontend Developer",
    expertise: [
      "HTML, CSS, JavaScript (ES6+)",
      "Vue.js and basic React",
      "Responsive design and CSS frameworks",
      "RESTful APIs and fetch",
      "Git and version control",
    ],
    background: "2 years of professional experience building user interfaces. Strong foundation in web fundamentals and component-based architecture. Looking to deepen knowledge and learn advanced patterns.",
  },
  
  fullstack: {
    name: "Sam",
    role: "Full-Stack Engineer",
    expertise: [
      "Node.js and Express",
      "React and Next.js",
      "SQL and NoSQL databases",
      "Authentication and authorization",
      "Docker and basic DevOps",
      "TypeScript",
    ],
    background: "5 years of experience building complete web applications. Solid understanding of both frontend and backend. Interested in advanced architecture, performance optimization, and emerging technologies.",
  },
  
  mobile: {
    name: "Taylor",
    role: "Mobile Developer",
    expertise: [
      "Swift and iOS development",
      "React Native",
      "Mobile app architecture (MVVM, Redux)",
      "REST APIs and GraphQL",
      "Mobile UI/UX patterns",
    ],
    background: "3 years building mobile applications. Strong understanding of native mobile development and cross-platform frameworks. Looking to expand web development skills and understand how web and mobile can integrate.",
  },
  
  senior: {
    name: "Morgan",
    role: "Senior Software Architect",
    expertise: [
      "System design and architecture",
      "Multiple programming languages and frameworks",
      "Microservices and distributed systems",
      "Performance optimization and scaling",
      "Team leadership and code review",
      "Cloud infrastructure (AWS, GCP, Azure)",
      "CI/CD and DevOps practices",
    ],
    background: "10+ years of experience across the full technology stack. Deep understanding of software engineering principles, design patterns, and best practices. Interested in cutting-edge technologies, architectural innovations, and how new tools can improve team productivity.",
  },
};

export function getPriorKnowledge(profile: keyof typeof priorKnowledgeProfiles): PriorKnowledge {
  return priorKnowledgeProfiles[profile];
}

export function listProfiles(): string[] {
  return Object.keys(priorKnowledgeProfiles);
}

