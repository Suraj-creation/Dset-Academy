export type WhitepaperCategory =
  | 'AI & Machine Learning'
  | 'Industrial IoT'
  | 'Mining Technology'
  | 'Healthcare AI'
  | 'Data Analytics'
  | 'Cloud Infrastructure';

export type PurposeOption =
  | 'Research'
  | 'Collaboration'
  | 'Implementation'
  | 'Consultation'
  | 'Other';

export interface Whitepaper {
  id: string;
  title: string;
  description: string;
  category: WhitepaperCategory;
  thumbnailUrl: string;
  pdfUrl: string;
  isPublished: boolean;
  downloadCount: number;
  createdAt: string;
  pageCount: number;
  readTime: string;
  tags: string[];
}

export interface WhitepaperLead {
  id: string;
  whitepaperID: string;
  whitepaperTitle: string;
  fullName: string;
  email: string;
  company: string;
  country: string;
  designation: string;
  purpose: PurposeOption;
  createdAt: string;
}

export const WHITEPAPER_CATEGORIES: WhitepaperCategory[] = [
  'AI & Machine Learning',
  'Industrial IoT',
  'Mining Technology',
  'Healthcare AI',
  'Data Analytics',
  'Cloud Infrastructure',
];

export const PURPOSE_OPTIONS: PurposeOption[] = [
  'Research',
  'Collaboration',
  'Implementation',
  'Consultation',
  'Other',
];

export const CATEGORY_META: Record<
  WhitepaperCategory,
  { gradient: string; icon: string; color: string; accentColor: string }
> = {
  'AI & Machine Learning': {
    gradient: 'linear-gradient(135deg, #1a0533 0%, #2d1060 50%, #1a0533 100%)',
    icon: '🤖',
    color: '#5e17ea',
    accentColor: 'rgba(94,23,234,0.2)',
  },
  'Industrial IoT': {
    gradient: 'linear-gradient(135deg, #001028 0%, #003366 50%, #001028 100%)',
    icon: '⚙️',
    color: '#1e90ff',
    accentColor: 'rgba(30,144,255,0.2)',
  },
  'Mining Technology': {
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)',
    icon: '⛏️',
    color: '#ff851b',
    accentColor: 'rgba(255,133,27,0.2)',
  },
  'Healthcare AI': {
    gradient: 'linear-gradient(135deg, #001a12 0%, #064e3b 50%, #001a12 100%)',
    icon: '🏥',
    color: '#10b981',
    accentColor: 'rgba(16,185,129,0.2)',
  },
  'Data Analytics': {
    gradient: 'linear-gradient(135deg, #13004d 0%, #2e1065 50%, #13004d 100%)',
    icon: '📊',
    color: '#8b5cf6',
    accentColor: 'rgba(139,92,246,0.2)',
  },
  'Cloud Infrastructure': {
    gradient: 'linear-gradient(135deg, #001020 0%, #0c2340 50%, #001020 100%)',
    icon: '☁️',
    color: '#38bdf8',
    accentColor: 'rgba(56,189,248,0.2)',
  },
};

export const MOCK_WHITEPAPERS: Whitepaper[] = [
  {
    id: 'wp-001',
    title: 'AI-Driven Predictive Maintenance in Industrial Mining Operations',
    description:
      'How real-time equipment health monitoring and predictive failure analysis reduces unplanned downtime by up to 60% in heavy industrial mining environments using edge AI.',
    category: 'Mining Technology',
    thumbnailUrl: '',
    pdfUrl: '#',
    isPublished: true,
    downloadCount: 142,
    createdAt: '2025-02-15T00:00:00Z',
    pageCount: 24,
    readTime: '12 min',
    tags: ['Predictive Maintenance', 'Edge AI', 'OT Systems'],
  },
  {
    id: 'wp-002',
    title: 'Industrial IoT Architecture: From Edge to Cloud in OT Environments',
    description:
      'A comprehensive guide to designing resilient IoT architectures that bridge operational technology (OT) and information technology (IT) layers for real-time industrial intelligence.',
    category: 'Industrial IoT',
    thumbnailUrl: '',
    pdfUrl: '#',
    isPublished: true,
    downloadCount: 98,
    createdAt: '2025-03-10T00:00:00Z',
    pageCount: 31,
    readTime: '16 min',
    tags: ['IIoT', 'OT/IT Integration', 'Edge Computing'],
  },
  {
    id: 'wp-003',
    title: 'Responsible AI in Healthcare: Compliance, Privacy & Clinical Validation',
    description:
      'Navigating HIPAA, FDA AI/ML guidance, and clinical validation frameworks when deploying AI-assisted diagnostics and decision support tools in regulated healthcare environments.',
    category: 'Healthcare AI',
    thumbnailUrl: '',
    pdfUrl: '#',
    isPublished: true,
    downloadCount: 211,
    createdAt: '2025-01-20T00:00:00Z',
    pageCount: 38,
    readTime: '19 min',
    tags: ['Healthcare AI', 'HIPAA', 'Clinical AI', 'Compliance'],
  },
  {
    id: 'wp-004',
    title: 'LLM Integration Patterns for Enterprise Applications',
    description:
      'Proven architecture patterns for integrating large language models into production enterprise systems — covering RAG pipelines, fine-tuning trade-offs, evaluation frameworks, and cost optimization.',
    category: 'AI & Machine Learning',
    thumbnailUrl: '',
    pdfUrl: '#',
    isPublished: true,
    downloadCount: 327,
    createdAt: '2025-04-05T00:00:00Z',
    pageCount: 42,
    readTime: '21 min',
    tags: ['LLMs', 'RAG', 'Enterprise AI', 'Architecture'],
  },
  {
    id: 'wp-005',
    title: 'Modern Data Lakehouse Architecture for Industrial Analytics',
    description:
      'How industrial operators can unify streaming sensor data, transactional records, and unstructured logs into a high-performance analytics platform using open lakehouse patterns.',
    category: 'Data Analytics',
    thumbnailUrl: '',
    pdfUrl: '#',
    isPublished: true,
    downloadCount: 74,
    createdAt: '2025-03-28T00:00:00Z',
    pageCount: 27,
    readTime: '14 min',
    tags: ['Data Lakehouse', 'Apache Iceberg', 'Streaming Analytics'],
  },
  {
    id: 'wp-006',
    title: 'Securing Cloud Workloads in Regulated Industries: A Zero-Trust Approach',
    description:
      'Zero-trust network architecture, identity federation, and workload isolation strategies for organizations operating cloud infrastructure in mining, energy, and healthcare sectors.',
    category: 'Cloud Infrastructure',
    thumbnailUrl: '',
    pdfUrl: '#',
    isPublished: false,
    downloadCount: 0,
    createdAt: '2025-05-01T00:00:00Z',
    pageCount: 29,
    readTime: '15 min',
    tags: ['Zero Trust', 'Cloud Security', 'Compliance'],
  },
  {
    id: 'wp-007',
    title: 'Digital Transformation Playbook for Mining Operations',
    description:
      'A structured methodology for mining companies transitioning from legacy operational systems to AI-enhanced, data-driven platforms — covering change management, ROI models, and phased rollout.',
    category: 'Mining Technology',
    thumbnailUrl: '',
    pdfUrl: '#',
    isPublished: true,
    downloadCount: 188,
    createdAt: '2025-02-01T00:00:00Z',
    pageCount: 35,
    readTime: '18 min',
    tags: ['Digital Transformation', 'Mining', 'Change Management'],
  },
  {
    id: 'wp-008',
    title: 'Real-Time Anomaly Detection at the Edge: Algorithms & Deployment',
    description:
      'Technical deep-dive into time-series anomaly detection algorithms optimized for resource-constrained edge devices in industrial settings, with deployment patterns and benchmarks.',
    category: 'Industrial IoT',
    thumbnailUrl: '',
    pdfUrl: '#',
    isPublished: false,
    downloadCount: 0,
    createdAt: '2025-05-10T00:00:00Z',
    pageCount: 33,
    readTime: '17 min',
    tags: ['Anomaly Detection', 'Edge AI', 'Time Series'],
  },
];

export const MOCK_WHITEPAPER_LEADS: WhitepaperLead[] = [
  {
    id: 'wl-001',
    whitepaperID: 'wp-004',
    whitepaperTitle: 'LLM Integration Patterns for Enterprise Applications',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@infosys.com',
    company: 'Infosys Limited',
    country: 'India',
    designation: 'AI/ML Architect',
    purpose: 'Implementation',
    createdAt: '2025-04-12T09:15:00Z',
  },
  {
    id: 'wl-002',
    whitepaperID: 'wp-001',
    whitepaperTitle: 'AI-Driven Predictive Maintenance in Industrial Mining',
    fullName: 'James Okafor',
    email: 'j.okafor@goldfields.com',
    company: 'Gold Fields Limited',
    country: 'South Africa',
    designation: 'Operations Director',
    purpose: 'Consultation',
    createdAt: '2025-04-18T14:30:00Z',
  },
  {
    id: 'wl-003',
    whitepaperID: 'wp-003',
    whitepaperTitle: 'Responsible AI in Healthcare',
    fullName: 'Dr. Meera Nair',
    email: 'm.nair@apollohospitals.com',
    company: 'Apollo Hospitals',
    country: 'India',
    designation: 'Chief Medical Information Officer',
    purpose: 'Research',
    createdAt: '2025-04-22T11:00:00Z',
  },
  {
    id: 'wl-004',
    whitepaperID: 'wp-002',
    whitepaperTitle: 'Industrial IoT Architecture: From Edge to Cloud',
    fullName: 'Stefan Weber',
    email: 's.weber@siemens.de',
    company: 'Siemens AG',
    country: 'Germany',
    designation: 'Senior Systems Engineer',
    purpose: 'Collaboration',
    createdAt: '2025-05-03T08:45:00Z',
  },
  {
    id: 'wl-005',
    whitepaperID: 'wp-004',
    whitepaperTitle: 'LLM Integration Patterns for Enterprise Applications',
    fullName: 'Rachel Thompson',
    email: 'r.thompson@deloitte.com',
    company: 'Deloitte Consulting',
    country: 'United States',
    designation: 'Technology Consultant',
    purpose: 'Research',
    createdAt: '2025-05-07T16:20:00Z',
  },
];
