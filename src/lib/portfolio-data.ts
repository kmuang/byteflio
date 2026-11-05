// ============================================================
//  BYTEFOLIO — YOUR TERMINAL PORTFOLIO
//  ============================================================
//  This is the ONLY file you need to edit.
//  Fill in your own details below and your portfolio is ready.
//  Everything in the terminal — commands, output, neofetch,
//  the file system — is driven entirely from this file.
// ============================================================

export interface Project {
  id: string;          // used as folder name in the virtual file system  (no spaces)
  name: string;        // display name shown in listings and project detail
  description: string; // one-sentence overview
  stack: string;       // comma-separated tech stack
  features: string;    // brief bullet list of key features
  challenges: string;  // what was technically interesting or hard
  demoLink?: string;   // optional — live URL
  githubLink?: string; // optional — repo URL
}

export interface Experience {
  role: string;        // job title
  company: string;     // company / client name
  period: string;      // e.g. "2022 – Present"
  description: string; // one-sentence summary of what you did
}

// ============================================================
//  IDENTITY — who you are
// ============================================================
export const portfolioData = {
  identity: {
    name:     "Your Name",                        // shown in whoami, neofetch, about
    title:    "Fullstack Developer & Designer",   // shown in whoami
    bio:      "I build fast, beautiful products with clean code and strong UX. " +
              "Passionate about developer tooling, open-source, and making the web feel good.",
    location: "Your City, Country",               // shown in about and neofetch
    email:    "you@example.com",                  // shown in contact
    github:   "https://github.com/yourusername",  // shown in contact, clickable link
    linkedin: "https://linkedin.com/in/yourusername", // shown in contact, clickable link
    resume:   "/resume.pdf",                      // place your PDF in /public/resume.pdf
  },

  // ============================================================
  //  SKILLS — your tech stack organised by category
  //  Add, remove, or rename categories freely.
  // ============================================================
  skills: [
    {
      category: "Frontend",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    },
    {
      category: "Backend",
      items: ["Node.js", "PostgreSQL", "Prisma", "Redis", "REST / GraphQL"],
    },
    {
      category: "Tools",
      items: ["Git", "Docker", "Figma", "Vercel", "AWS"],
    },
    {
      category: "Workflow",
      items: ["Agile", "TDD", "CI/CD", "Technical Writing"],
    },
  ],

  // ============================================================
  //  PROJECTS — each project becomes a folder in ~/projects/
  //
  //  id          → folder name   (no spaces, lowercase, hyphens ok)
  //  features    → multi-line is fine, use \n to separate bullet points
  //  demoLink    → omit the key entirely if you don't have a live demo
  //  githubLink  → omit if the repo is private
  // ============================================================
  projects: [
    {
      id:          "saas-dashboard",
      name:        "SaaS Analytics Dashboard",
      description: "Real-time analytics platform for SaaS businesses with multi-tenant support.",
      stack:       "Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Recharts",
      features:    "• Multi-tenant architecture with role-based access\n" +
                   "• Real-time metrics via WebSocket push\n" +
                   "• CSV / PDF export and scheduled email reports\n" +
                   "• Dark / light theme with customizable colour palette",
      challenges:  "Designing a query layer that serves both per-tenant row-level isolation " +
                   "and aggregated cross-tenant admin views without N+1 problems.",
      demoLink:   "https://demo.yourdomain.com/saas",
      githubLink: "https://github.com/yourusername/saas-dashboard",
    },
    {
      id:          "ai-writing-tool",
      name:        "AI Writing Assistant",
      description: "Browser extension that rewrites, summarises, and tone-shifts selected text using Claude.",
      stack:       "TypeScript, Plasmo, Anthropic SDK, Tailwind CSS",
      features:    "• Context-menu integration — works on any editable field\n" +
                   "• Six preset tones (formal, casual, persuasive, concise, expand, ELI5)\n" +
                   "• Prompt history with one-click re-use\n" +
                   "• Offline queue — retries when connection returns",
      challenges:  "Injecting a shadow-DOM overlay reliably across hundreds of different " +
                   "host-page CSS environments without style conflicts.",
      demoLink:   "https://chromewebstore.google.com/your-extension",
      githubLink: "https://github.com/yourusername/ai-writing-tool",
    },
    {
      id:          "open-source-cli",
      name:        "devkit CLI",
      description: "Zero-config CLI that scaffolds projects, runs linting, and manages env secrets.",
      stack:       "Node.js, TypeScript, Commander, Inquirer, Zod",
      features:    "• Interactive project scaffolding with 12 built-in templates\n" +
                   "• Encrypted .env vault with team-sharing via signed URLs\n" +
                   "• Parallel task runner with live progress bars\n" +
                   "• Plugin API — ship your own sub-commands as npm packages",
      challenges:  "Building a plugin system that loads untrusted third-party code safely " +
                   "inside a Node worker thread with resource caps.",
      githubLink: "https://github.com/yourusername/devkit-cli",
      // no demoLink — CLI-only tool
    },
  ] as Project[],

  // ============================================================
  //  EXPERIENCE — work history shown by the `experience` command
  //  Most recent role should be first.
  // ============================================================
  experience: [
    {
      role:        "Senior Fullstack Engineer",
      company:     "Acme Corp",
      period:      "2022 – Present",
      description: "Tech lead for the customer-facing platform. Reduced page load by 40 %, " +
                   "migrated the monolith to a service-oriented architecture, mentored 4 juniors.",
    },
    {
      role:        "Frontend Developer",
      company:     "Pixel Studio",
      period:      "2020 – 2022",
      description: "Built high-fidelity, animated UIs for agency clients using React and " +
                   "Framer Motion. Delivered 15+ projects on time and under budget.",
    },
    {
      role:        "Junior Developer",
      company:     "Freelance",
      period:      "2018 – 2020",
      description: "WordPress and Shopify builds for small businesses. First exposure to " +
                   "CI/CD pipelines and automated testing.",
    },
  ] as Experience[],
};
