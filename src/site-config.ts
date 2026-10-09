// Define the site configuration
export const siteConfig = {
  // Site details
  name: "The Null Hypothesis",
  url: "https://kumak.dev",
  description: "Front-end, LLM tooling, and what actually works.",
  tagline: "Front-end, LLM tooling, and what actually works.",
  image: "/social-image.jpg",
  // Author/owner info
  author: {
    name: "Szymon Dzumak",
    handle: "Kumak",
  },

  socials: {
    github: {
      name: "GitHub",
      url: "https://github.com/szymdzum",
    },
    linkedin: {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/szymon-dzumak",
    },
    rss: {
      name: "RSS Feed",
      url: "/rss.xml",
    },
  },

  // Giscus comments configuration
  giscus: {
    repo: "szymdzum/kumak-dev",
    repoId: "R_kgDOPucytg",
    category: "General",
    categoryId: "DIC_kwDOPucyts4Cx3AI",
  },
} as const;
