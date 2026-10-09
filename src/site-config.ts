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

  // Umami analytics (client script in Head, server-side events in utils/analytics)
  umami: {
    url: "https://analytics.kumak.dev",
    websiteId: "9a78de62-6e9d-4d7b-8e0c-998a85550282",
  },

  // Giscus comments configuration
  giscus: {
    repo: "szymdzum/kumak-dev",
    repoId: "R_kgDOPucytg",
    category: "General",
    categoryId: "DIC_kwDOPucyts4Cx3AI",
  },
} as const;
