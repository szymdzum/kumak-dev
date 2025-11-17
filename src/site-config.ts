// Define the site configuration
export const siteConfig = {
  // Site details
  name: "The Null Hypothesis",
  url: "https://kumak.dev",
  description: "A blog about technology, programming, and more",
  tagline: "Where decade of code meet moments of clarity.",
  image: "/social-image-home.jpg",
  // Author/owner info
  author: "Kumak",

  socials: {
    github: {
      name: "GitHub",
      url: "https://github.com/szymdzum",
    },
    linkedin: {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/szymon-dzumak",
    },
  },

  // Navigation items
  navItems: [],

  // Giscus comments configuration
  giscus: {
    repo: "szymdzum/kumak-dev",
    repoId: "R_kgDOPucytg",
    category: "General",
    categoryId: "DIC_kwDOPucyts4Cx3AI",
  },
} as const;
