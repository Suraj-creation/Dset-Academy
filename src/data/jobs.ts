export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  color: string;
  description: string;
}

export const jobListings: Job[] = [
  {
    id: 1,
    title: 'AI/ML Engineer - Mining & Industrial',
    department: 'Engineering',
    location: 'Bengaluru, India',
    type: 'Full-time',
    level: 'Mid-Senior',
    color: '#ff851b',
    description:
      'Build and deploy vertical AI models for OreBill AI and EdgeBay platforms with real-world OT/IT data from mining and industrial environments.',
  },
  {
    id: 2,
    title: 'Full Stack Engineer (Next.js / Node)',
    department: 'Engineering',
    location: 'Bengaluru, India',
    type: 'Full-time',
    level: 'Mid-Level',
    color: '#1e90ff',
    description:
      'Build platform UIs and APIs for our vertical AI products, including real-time dashboards, agentic workflows, and enterprise integrations.',
  },
  {
    id: 3,
    title: 'Product Manager - Vertical AI Platforms',
    department: 'Product',
    location: 'Bengaluru, India',
    type: 'Full-time',
    level: 'Senior',
    color: '#5e17ea',
    description:
      "Own the roadmap for one of DSeT's vertical platforms and work across engineering, sales, and customers to shape products that solve operational problems.",
  },
  {
    id: 4,
    title: 'DevOps / Platform Engineer',
    department: 'Infrastructure',
    location: 'Bengaluru / Remote',
    type: 'Full-time',
    level: 'Mid-Level',
    color: '#0ea5e9',
    description:
      'Manage cloud, edge, and hybrid infrastructure for AI platform deployments across Azure, Docker, Kubernetes, and on-premise environments.',
  },
  {
    id: 5,
    title: 'Enterprise Sales Executive',
    department: 'Sales',
    location: 'Bengaluru, India',
    type: 'Full-time',
    level: 'Senior',
    color: '#22c55e',
    description:
      'Drive enterprise pipeline for DSeT AI platforms in mining, industrial, and healthcare sectors with a strong B2B SaaS or enterprise software sales motion.',
  },
  {
    id: 6,
    title: 'Intern - AI/ML & Data Engineering',
    department: 'Engineering',
    location: 'Bengaluru, India',
    type: 'Internship',
    level: 'Fresher',
    color: '#a855f7',
    description:
      'Work on real AI platform problems with full mentorship from the core team across OreBill AI, EdgeBay, and MedicsIQ pipelines.',
  },
];
