// Questions and answers, written to be found and quoted. Each answer opens
// with the plain answer in a sentence that still makes sense on its own and
// names what it is about. No em dashes and no semicolons. Each paragraph of
// an answer is one string.
//
// They are shown twice: in the page (closed answers stay in the HTML) and as
// FAQPage structured data.

export type Faq = { question: string; answer: string[] }

/** The home page: questions about agent skills and this collection. */
export const HOME_FAQ: Faq[] = [
  {
    question: "What are agent skills?",
    answer: [
      "Agent skills are folders of instructions that a coding agent loads when a task calls for them. A skill has a SKILL.md file with a name, a description of when to use it and a workflow, plus optional reference notes and code to adapt.",
      "The agent reads only the short description until the task matches, then loads the rest. That keeps the context small and the guidance specific.",
    ],
  },
  {
    question: "What is Earned UI Skills?",
    answer: [
      "Earned UI Skills is a free, open source collection of agent skills for building user interfaces. Each skill comes from a real build and carries the order to work in, the rules, a small reference implementation and the mistakes worth not repeating.",
      "It has two skills today: liquid-glass-web for Apple style Liquid Glass with real refraction, and widget-bento-web for a bento of live widgets.",
    ],
  },
  {
    question: "How do I install these skills in Claude Code?",
    answer: [
      "Install the skills in Claude Code by running npx skills add sougata-github/earned-ui-skills in your project. The skills CLI copies each skill into the folder Claude Code reads, and Claude loads a skill when your request matches its description.",
      "To install one skill, add --skill and its name, for example --skill liquid-glass-web.",
    ],
  },
  {
    question: "Do the skills work with Codex and Cursor?",
    answer: [
      "Yes. The skills work with Codex and Cursor as well as Claude Code. They follow the open agent skills format, and the skills CLI installs them for each agent it supports.",
    ],
  },
  {
    question: "How is a skill different from a component library?",
    answer: [
      "A skill is a workflow, and a component library is a fixed set of parts. A library gives you the components its authors built. A skill gives your agent the method to build your own, in your stack, with your content.",
      "That is why each skill here ships a small reference implementation to adapt and not a package to install.",
    ],
  },
  {
    question: "Are the skills free?",
    answer: [
      "Yes. Earned UI Skills is free and MIT licensed. You can use the skills and the code in them in personal and commercial projects.",
    ],
  },
  {
    question: "What is the difference between a skill and an MCP server?",
    answer: [
      "A skill teaches an agent how to do something, and an MCP server gives an agent a tool to call. A skill is text and files the agent reads. An MCP server is a running program that returns data or takes actions.",
      "These UI skills need no server. They work with the files in your project.",
    ],
  },
  {
    question: "Why do AI generated interfaces look the same?",
    answer: [
      "AI generated interfaces look the same because an agent without specific guidance falls back on the most common patterns it has seen. A skill replaces those defaults with a tested workflow and concrete rules, such as building a lab to tune a look by eye before any component ships.",
    ],
  },
]
