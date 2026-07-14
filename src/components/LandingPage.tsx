import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Code, Database, UserCheck, Play, Smartphone, Settings, Brain, Shield, Cloud, Cpu, FileText, Sparkles, Layout, Server, Monitor, Gamepad, BarChart3, ClipboardList, LineChart, Link2, PieChart, Network, Zap, Megaphone, Landmark, Wrench, Lightbulb, Building2, FlaskConical, CircuitBoard, Terminal, FileCode, Code2, User as UserIcon, UserPlus, UserMinus, ShieldAlert, Microscope } from 'lucide-react';
import { Domain, InterviewerPersona } from '../types';
import { cn } from '../lib/utils';

import { onAuthStateChanged, User } from 'firebase/auth';

interface LandingPageProps {
  onStart: (domain: Domain, resumeOrJD?: string, difficulty?: 'Easy' | 'Medium' | 'Hard', persona?: InterviewerPersona) => void;
  user: User | null;
}

const domains: { name: Domain; icon: React.ReactNode; description: string }[] = [
  {
    name: 'Frontend Development',
    icon: <Code className="w-8 h-8" />,
    description: 'React, Vue, CSS, and modern web interfaces.',
  },
  {
    name: 'Backend Development',
    icon: <Database className="w-8 h-8" />,
    description: 'Node.js, Python, SQL, and system architecture.',
  },
  {
    name: 'Fullstack Development',
    icon: <Play className="w-8 h-8" />,
    description: 'End-to-end application development and integration.',
  },
  {
    name: 'Mobile App Development',
    icon: <Smartphone className="w-8 h-8" />,
    description: 'iOS, Android, React Native, and Flutter.',
  },
  {
    name: 'DevOps & SRE',
    icon: <Settings className="w-8 h-8" />,
    description: 'CI/CD, Kubernetes, Docker, and Infrastructure as Code.',
  },
  {
    name: 'AI & Machine Learning',
    icon: <Brain className="w-8 h-8" />,
    description: 'LLMs, PyTorch, TensorFlow, and data modeling.',
  },
  {
    name: 'Data Engineering',
    icon: <Database className="w-8 h-8" />,
    description: 'ETL pipelines, Spark, Hadoop, and Big Data.',
  },
  {
    name: 'Software Testing & QA',
    icon: <Shield className="w-8 h-8" />,
    description: 'Automation, Unit Testing, and Quality Assurance.',
  },
  {
    name: 'UI/UX Design',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Figma, User Research, and Design Systems.',
  },
  {
    name: 'Cybersecurity',
    icon: <Shield className="w-8 h-8" />,
    description: 'Network security, ethical hacking, and encryption.',
  },
  {
    name: 'Data Science',
    icon: <Database className="w-8 h-8" />,
    description: 'Statistics, machine learning, and data analysis.',
  },
  {
    name: 'Core Fundamentals (Fresher)',
    icon: <Cpu className="w-8 h-8" />,
    description: 'OOPs, DBMS, OS, and Networking basics for entry-level roles.',
  },
  {
    name: 'Cloud Computing',
    icon: <Cloud className="w-8 h-8" />,
    description: 'AWS, Azure, Docker, and Kubernetes.',
  },
  {
    name: 'Mechanical Engineering',
    icon: <Wrench className="w-8 h-8" />,
    description: 'Thermodynamics, mechanics, and manufacturing.',
  },
  {
    name: 'Electrical Engineering',
    icon: <Lightbulb className="w-8 h-8" />,
    description: 'Power systems, circuit analysis, and control systems.',
  },
  {
    name: 'Civil Engineering',
    icon: <Building2 className="w-8 h-8" />,
    description: 'Structural analysis, surveying, and construction.',
  },
  {
    name: 'Chemical Engineering',
    icon: <FlaskConical className="w-8 h-8" />,
    description: 'Process design, thermodynamics, and mass transfer.',
  },
  {
    name: 'Electronics & Communication Engineering',
    icon: <CircuitBoard className="w-8 h-8" />,
    description: 'Signal processing, communication, and VLSI.',
  },
  {
    name: 'Aptitude & Reasoning',
    icon: <Play className="w-8 h-8" />,
    description: 'Logical reasoning, diagrammatic questions, and math.',
  },
  {
    name: 'HR & Behavioral',
    icon: <UserCheck className="w-8 h-8" />,
    description: 'Soft skills, situational judgment, and cultural fit.',
  },
  {
    name: 'Personalized',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Custom interview based on your specific Resume or Job Description.',
  },
  {
    name: 'System Design',
    icon: <Layout className="w-8 h-8" />,
    description: 'Scalability, distributed systems, and architectural patterns.',
  },
  {
    name: 'Database Management',
    icon: <Server className="w-8 h-8" />,
    description: 'SQL, NoSQL, indexing, and query optimization.',
  },
  {
    name: 'Embedded Systems',
    icon: <Monitor className="w-8 h-8" />,
    description: 'Microcontrollers, RTOS, and low-level C/C++ programming.',
  },
  {
    name: 'Game Development',
    icon: <Gamepad className="w-8 h-8" />,
    description: 'Unity, Unreal Engine, physics, and game mechanics.',
  },
  {
    name: 'Product Management',
    icon: <BarChart3 className="w-8 h-8" />,
    description: 'Product strategy, roadmap, and user-centric design.',
  },
  {
    name: 'Project Management',
    icon: <ClipboardList className="w-8 h-8" />,
    description: 'Agile, Scrum, risk management, and team coordination.',
  },
  {
    name: 'Business Analysis',
    icon: <LineChart className="w-8 h-8" />,
    description: 'Requirement gathering, data-driven decisions, and ROI.',
  },
  {
    name: 'Blockchain Development',
    icon: <Link2 className="w-8 h-8" />,
    description: 'Smart contracts, Ethereum, and decentralized apps.',
  },
  {
    name: 'Data Analytics',
    icon: <PieChart className="w-8 h-8" />,
    description: 'Data visualization, business intelligence, and reporting.',
  },
  {
    name: 'Cloud Architecture',
    icon: <Network className="w-8 h-8" />,
    description: 'Designing scalable, reliable, and secure cloud solutions.',
  },
  {
    name: 'Sales & Marketing',
    icon: <Megaphone className="w-8 h-8" />,
    description: 'Sales strategy, digital marketing, and lead generation.',
  },
  {
    name: 'Finance & Accounting',
    icon: <Landmark className="w-8 h-8" />,
    description: 'Financial analysis, auditing, and corporate finance.',
  },
];

const codingQuizzes: { name: Domain; icon: React.ReactNode; description: string }[] = [
  {
    name: 'C Programming (Quiz)',
    icon: <Terminal className="w-8 h-8" />,
    description: 'Error detection and output guessing in C.',
  },
  {
    name: 'Java Programming (Quiz)',
    icon: <FileCode className="w-8 h-8" />,
    description: 'Core Java concepts, error detection, and output.',
  },
  {
    name: 'Python Programming (Quiz)',
    icon: <Code2 className="w-8 h-8" />,
    description: 'Pythonic ways, error detection, and output guessing.',
  },
  {
    name: 'C++ Programming (Quiz)',
    icon: <Code className="w-8 h-8" />,
    description: 'OOPs, STL, error detection, and output in C++.',
  },
];

const companies: { name: Domain; logo: string; description: string; color: string; tags: string[]; difficulty: 'Easy' | 'Medium' | 'Hard'; category: 'MAANG' | 'Service' | 'Consulting' | 'Product' }[] = [
  {
    name: 'TCS',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/512px-Tata_Consultancy_Services_Logo.svg.png',
    description: 'Technical basics and aptitude rounds.',
    color: '#004b8d',
    tags: ['Aptitude', 'Java', 'C++'],
    difficulty: 'Easy',
    category: 'Service'
  },
  {
    name: 'Infosys',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/512px-Infosys_logo.svg.png',
    description: 'Logical reasoning and core engineering.',
    color: '#007cc3',
    tags: ['Logic', 'Python', 'DBMS'],
    difficulty: 'Easy',
    category: 'Service'
  },
  {
    name: 'HCL',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/HCL_Technologies_logo.svg/512px-HCL_Technologies_logo.svg.png',
    description: 'Software services and infrastructure management.',
    color: '#005696',
    tags: ['Cloud', 'Networking', 'OS'],
    difficulty: 'Easy',
    category: 'Service'
  },
  {
    name: 'Wipro',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Logo.svg/512px-Wipro_Logo.svg.png',
    description: 'Software development and digital transformation.',
    color: '#000000',
    tags: ['SDLC', 'Java', 'Testing'],
    difficulty: 'Easy',
    category: 'Service'
  },
  {
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/512px-Microsoft_logo_%282012%29.svg.png',
    description: 'Core fundamentals and problem solving.',
    color: '#f25022',
    tags: ['DSA', 'Azure', 'System Design'],
    difficulty: 'Hard',
    category: 'MAANG'
  },
  {
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_logo_%282015%29.svg/512px-Google_logo_%282015%29.svg.png',
    description: 'Focus on DSA, System Design, and Googlyness.',
    color: '#4285f4',
    tags: ['DSA', 'Scalability', 'Algorithms'],
    difficulty: 'Hard',
    category: 'MAANG'
  },
  {
    name: 'LTIMindtree',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/LTIMindtree_logo.svg/512px-LTIMindtree_logo.svg.png',
    description: 'Digital solutions and enterprise technology.',
    color: '#ed1c24',
    tags: ['Enterprise', 'Cloud', 'Fullstack'],
    difficulty: 'Medium',
    category: 'Service'
  },
  {
    name: 'Tech Mahindra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Tech_Mahindra_logo.svg/512px-Tech_Mahindra_logo.svg.png',
    description: 'IT services and business process outsourcing.',
    color: '#e31e24',
    tags: ['Telecom', 'Testing', 'Java'],
    difficulty: 'Easy',
    category: 'Service'
  },
  {
    name: 'Cognizant',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Cognizant_logo_2022.svg/512px-Cognizant_logo_2022.svg.png',
    description: 'Consulting and technology services.',
    color: '#0033a0',
    tags: ['Consulting', 'Agile', 'Web'],
    difficulty: 'Medium',
    category: 'Consulting'
  },
  {
    name: 'Mphasis',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mphasis_Logo.svg/512px-Mphasis_Logo.svg.png',
    description: 'Cloud and cognitive software solutions.',
    color: '#000000',
    tags: ['Cloud', 'AI', 'Microservices'],
    difficulty: 'Medium',
    category: 'Service'
  },
  {
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png',
    description: 'Leadership Principles and scalable systems.',
    color: '#ff9900',
    tags: ['Leadership', 'DSA', 'AWS'],
    difficulty: 'Hard',
    category: 'MAANG'
  },
  {
    name: 'Meta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png',
    description: 'Product sense and technical excellence.',
    color: '#0668E1',
    tags: ['Product', 'React', 'Algorithms'],
    difficulty: 'Hard',
    category: 'MAANG'
  },
  {
    name: 'Apple',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png',
    description: 'Design thinking and hardware-software integration.',
    color: '#000000',
    tags: ['Swift', 'Hardware', 'UX'],
    difficulty: 'Hard',
    category: 'MAANG'
  },
  {
    name: 'Accenture',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/512px-Accenture.svg.png',
    description: 'Global professional services and digital transformation.',
    color: '#a100ff',
    tags: ['Consulting', 'Digital', 'Strategy'],
    difficulty: 'Medium',
    category: 'Consulting'
  },
  {
    name: 'Zoho',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Zoho_logo.svg/512px-Zoho_logo.svg.png',
    description: 'Deep coding and logical problem solving.',
    color: '#e31e24',
    tags: ['Coding', 'Logic', 'SaaS'],
    difficulty: 'Medium',
    category: 'Product'
  },
];

const getCompanyStats = (company: typeof companies[0]) => {
  const statsMap: Record<string, { topics: string[]; acceptanceRate: string; ctcFocus: string; duration: string; pattern: string }> = {
    Google: {
      topics: ['Dynamic Programming', 'Graph Theory', 'System Design (Scale)', 'Advanced Trees', 'Googlyness'],
      acceptanceRate: '1.2%',
      ctcFocus: '32 - 60+ LPA',
      duration: '5 - 7 Weeks',
      pattern: '5 Rounds (1 Coding, 3 Systems/DSA, 1 Googlyness)'
    },
    Microsoft: {
      topics: ['System Design', 'Arrays & Strings', 'Linked Lists & Trees', 'Concurrency', 'OS Fundamentals'],
      acceptanceRate: '1.8%',
      ctcFocus: '28 - 50 LPA',
      duration: '4 - 6 Weeks',
      pattern: '4-5 Rounds (Technical + System Architecture)'
    },
    Amazon: {
      topics: ['Leadership Principles', 'System Design', 'Graphs & Trees', 'DP & Greedy Algorithms', 'Object Oriented Design'],
      acceptanceRate: '2.1%',
      ctcFocus: '24 - 45 LPA',
      duration: '3 - 5 Weeks',
      pattern: '4 Rounds (Bar Raiser + Leadership focus in all rounds)'
    },
    Meta: {
      topics: ['Coding (Speed & Accuracy)', 'System Design', 'Product Architecture', 'Behavioral (Cultural Fit)', 'Caching & Databases'],
      acceptanceRate: '1.5%',
      ctcFocus: '30 - 55 LPA',
      duration: '4 - 6 Weeks',
      pattern: '4 Rounds (Rigorously structured Coding + Systems)'
    },
    Apple: {
      topics: ['Low-Level Design', 'Operating Systems', 'Concurrency & Memory', 'Design Patterns', 'Swift & C++ Core'],
      acceptanceRate: '1.4%',
      ctcFocus: '26 - 52 LPA',
      duration: '5 - 8 Weeks',
      pattern: '5 Rounds (Deep hardware/software interaction assessment)'
    },
    TCS: {
      topics: ['C/C++ basics', 'Java SE Essentials', 'Quantitative Aptitude', 'SQL Select Queries', 'TCS NQT Prep'],
      acceptanceRate: '8.5%',
      ctcFocus: '3.6 - 7.2 LPA',
      duration: '1 - 2 Weeks',
      pattern: '2 Rounds (Online NQT Test + Technical/HR Interview)'
    },
    Infosys: {
      topics: ['Basic OOP Concepts', 'DBMS/SQL Basics', 'Puzzle Solving & Logic', 'Data Structures Basics', 'Communication Skills'],
      acceptanceRate: '9.2%',
      ctcFocus: '3.6 - 8.0 LPA',
      duration: '1 - 2 Weeks',
      pattern: '2 Rounds (InfyTQ/HackWithInfy or Direct + Tech/HR Interview)'
    },
    Wipro: {
      topics: ['Java Core/Python Basics', 'Manual & Automation Testing', 'SDLC Process', 'Basic SQL', 'Aptitude & Verbal'],
      acceptanceRate: '8.8%',
      ctcFocus: '3.5 - 7.0 LPA',
      duration: '1 - 2 Weeks',
      pattern: '2 Rounds (Elite National Talent Hunt assessment + Tech interview)'
    },
    HCL: {
      topics: ['Cloud Infrastructure Basics', 'Networking (TCP/IP)', 'OS Administration', 'ITIL Framework', 'Troubleshooting Basics'],
      acceptanceRate: '10.0%',
      ctcFocus: '3.5 - 6.5 LPA',
      duration: '1 - 2 Weeks',
      pattern: '2 Rounds (Group Discussion/Online Assessment + Technical)'
    },
    'Tech Mahindra': {
      topics: ['Telecom Domain Basics', 'Java Programming Basics', 'Software QA', 'SQL Databases', 'Analytical Aptitude'],
      acceptanceRate: '9.5%',
      ctcFocus: '3.6 - 6.0 LPA',
      duration: '1 - 2 Weeks',
      pattern: '2 Rounds (AMCAT / Direct Online Test + Tech/HR Panel)'
    },
    LTIMindtree: {
      topics: ['Enterprise Web Platforms', 'Cloud Architecture (AWS/Azure)', 'Java / .NET Frameworks', 'REST APIs', 'SQL Database Normalization'],
      acceptanceRate: '6.2%',
      ctcFocus: '4.5 - 10.0 LPA',
      duration: '2 - 3 Weeks',
      pattern: '3 Rounds (Coding Assessment + Technical Round + HR)'
    },
    Cognizant: {
      topics: ['Agile Methodologies', 'Fullstack Web Foundations', 'SQL & RDBMS Concepts', 'Coding & Logic', 'Client Interaction Skills'],
      acceptanceRate: '7.5%',
      ctcFocus: '4.0 - 9.0 LPA',
      duration: '2 - 3 Weeks',
      pattern: '2-3 Rounds (GenC Premium/Elevate assessment + Interviews)'
    },
    Accenture: {
      topics: ['Digital Transformation Cases', 'Enterprise Cloud Strategies', 'Agile & DevOps Workflow', 'General Problem Solving', 'Strategic Communication'],
      acceptanceRate: '6.8%',
      ctcFocus: '4.5 - 11.0 LPA',
      duration: '2 - 3 Weeks',
      pattern: '3 Rounds (Cognitive Evaluation + Technical + HR Discussion)'
    },
    Mphasis: {
      topics: ['Microservices Design', 'Java Fundamentals', 'Cognitive/AI Concepts', 'Cloud Deployment', 'SQL & Core Data Structures'],
      acceptanceRate: '7.0%',
      ctcFocus: '4.0 - 8.5 LPA',
      duration: '2 - 3 Weeks',
      pattern: '2 Rounds (CoCubes Online Assessment + Technical/HR Panel)'
    },
    Zoho: {
      topics: ['Complex Algorithmic Coding', 'Object-Oriented Programming', 'L2 Application Design/Creation', 'Java SE/C++ Fundamentals', 'Problem Solving Speed'],
      acceptanceRate: '3.5%',
      ctcFocus: '6.0 - 15.0 LPA',
      duration: '2 - 4 Weeks',
      pattern: '5 Rounds (Multiple code writing levels + App design challenge)'
    }
  };

  return statsMap[company.name] || {
    topics: ['System Design', 'Operating Systems', 'Data Structures & Algorithms', 'Databases & SQL', ...company.tags],
    acceptanceRate: company.difficulty === 'Hard' ? '2.0%' : company.difficulty === 'Medium' ? '5.0%' : '10.0%',
    ctcFocus: company.difficulty === 'Hard' ? '20 - 45 LPA' : company.difficulty === 'Medium' ? '8 - 18 LPA' : '3.6 - 7.5 LPA',
    duration: '2 - 4 Weeks',
    pattern: 'Technical Assessment + Structured Interview Rounds'
  };
};

const getCompanySVG = (src: string, alt: string) => {
  const normalized = (src + " " + alt).toLowerCase();
  
  if (normalized.includes("google")) {
    return (
      <svg viewBox="0 0 24 24" className="w-full h-full max-h-[80%] max-w-[80%]">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.88-2.6-2.88-4.53-6.19-4.53z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    );
  }
  
  if (normalized.includes("microsoft")) {
    return (
      <svg viewBox="0 0 23 23" className="w-full h-full max-h-[80%] max-w-[80%]">
        <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
        <rect x="12" y="0" width="11" height="11" fill="#7FBA00"/>
        <rect x="0" y="12" width="11" height="11" fill="#00A4EF"/>
        <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
      </svg>
    );
  }
  
  if (normalized.includes("apple")) {
    return (
      <svg viewBox="0 0 170 170" className="w-full h-full max-h-[80%] max-w-[80%] fill-white/90">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.35-6.15-2.89-2.38-6.61-6.85-11.19-13.44-4.74-6.81-8.76-14.65-12.03-23.51-3.26-8.86-4.9-17.61-4.9-26.25 0-14.12 3.55-25.5 10.65-34.14 7.1-8.63 15.86-12.98 26.28-13.04 5.13 0 10.51 1.54 16.14 4.63 5.63 3.1 9.4 4.65 11.3 4.65 1.56 0 5.07-1.41 10.53-4.25 5.46-2.83 10.61-4.16 15.45-4.01 10.94.45 19.64 4.54 26.11 12.28-11.38 6.87-16.93 16.01-16.65 27.42.3 9.94 4.09 18.06 11.38 24.36 7.29 6.3 15.67 9.61 25.13 9.93-1.78 5.41-4.22 11.18-7.31 17.31zM120.5 34.35c0-8.14-2.89-15.45-8.66-21.93 5.9 0 12.15 2.94 16.27 8.16 4.12 5.22 6.09 11.96 5.46 18.96-6.68.53-13.07-2.61-17.61-8.08C121.78 46.21 120.5 40.42 120.5 34.35z"/>
      </svg>
    );
  }
  
  if (normalized.includes("meta")) {
    return (
      <svg viewBox="0 0 512 512" className="w-full h-full max-h-[85%] max-w-[85%]">
        <path fill="#0668E1" d="M434.6 157c-17.2-22.3-43.9-37.1-73.4-37.1-39 0-72.3 25.9-88.7 54.8-13.8-24.3-46.7-54.8-88.7-54.8-29.5 0-56.2 14.8-73.4 37.1-23.7 30.7-33.6 74.3-19.8 116.3 13.9 42.4 48.7 75.8 93.2 75.8 40.5 0 71.9-29.2 88.7-54.8 16.8 25.6 48.2 54.8 88.7 54.8 44.5 0 79.3-33.4 93.2-75.8 13.8-42 3.9-85.6-19.8-116.3zm-271.1 143c-25.1 0-46.2-16.6-54.2-40.2-8-23.8-1.5-49.4 12.6-67.7 9.8-12.7 24.5-21.1 41.6-21.1 27.5 0 51.5 25.8 61.3 49.3 1 2.3 1.8 4.7 2.4 7-6.2 24.2-31.5 72.7-63.7 72.7zm192.5 0c-32.2 0-57.5-48.5-63.7-72.7.6-2.3 1.4-4.7 2.4-7 9.8-23.5 33.8-49.3 61.3-49.3 17.1 0 31.8 8.4 41.6 21.1 14.1 18.3 20.6 43.9 12.6 67.7-8 23.6-29.1 40.2-54.2 40.2z"/>
      </svg>
    );
  }
  
  if (normalized.includes("amazon")) {
    return (
      <svg viewBox="0 0 100 45" className="w-full h-full max-h-[85%] max-w-[85%]">
        <text x="50%" y="22" textAnchor="middle" className="font-sans font-black text-[17px] fill-white tracking-tighter">amazon</text>
        <path d="M12 28 Q 50 44, 88 28 M 88 28 L 81 24 M 88 28 L 86 35" fill="none" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalized.includes("tata") || normalized.includes("tcs")) {
    return (
      <svg viewBox="0 0 100 75" className="w-full h-full max-h-[85%] max-w-[85%]">
        <path d="M50 12C33 12 18 24 18 42C18 44 19 46 21 46C24 46 25 43 27 39C31 30 40 23 50 23C60 23 69 30 73 39C75 43 76 46 79 46C81 46 82 44 82 42C82 24 67 12 50 12Z" fill="#004b8d" />
        <path d="M44 38 L50 20 L56 38 Z" fill="#004b8d" opacity="0.8" />
        <text x="50" y="64" textAnchor="middle" className="fill-white font-sans font-black text-[11px] tracking-[0.22em]">TCS</text>
      </svg>
    );
  }

  if (normalized.includes("infosys")) {
    return (
      <svg viewBox="0 0 120 45" className="w-full h-full max-h-[85%] max-w-[85%]">
        <text x="50%" y="24" textAnchor="middle" className="font-sans font-black text-[18px] fill-[#007cc3] tracking-tighter italic">Infosys</text>
        <path d="M22 34 Q 60 42, 98 34" stroke="#007cc3" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  if (normalized.includes("hcl")) {
    return (
      <svg viewBox="0 0 100 45" className="w-full h-full max-h-[85%] max-w-[85%]">
        <text x="45%" y="28" textAnchor="middle" className="font-sans font-black text-[24px] fill-[#005696] tracking-tight italic">HCL</text>
        <rect x="76" y="10" width="10" height="20" fill="#00AAFF" transform="skewX(-15)" />
      </svg>
    );
  }

  if (normalized.includes("wipro")) {
    return (
      <svg viewBox="0 0 50 50" className="w-full h-full max-h-[85%] max-w-[85%]">
        <circle cx="25" cy="25" r="16" fill="none" stroke="url(#wiproG1)" strokeWidth="4" />
        <circle cx="25" cy="25" r="9" fill="none" stroke="url(#wiproG2)" strokeWidth="3.2" />
        <circle cx="25" cy="25" r="3" fill="#ffffff" />
        <defs>
          <linearGradient id="wiproG1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A90E2" />
            <stop offset="50%" stopColor="#50E3C2" />
            <stop offset="100%" stopColor="#B8E986" />
          </linearGradient>
          <linearGradient id="wiproG2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF85A2" />
            <stop offset="100%" stopColor="#FFC952" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (normalized.includes("mahindra")) {
    return (
      <svg viewBox="0 0 100 65" className="w-full h-full max-h-[85%] max-w-[85%]">
        <path d="M15 48 L35 15 L50 35 L65 15 L85 48" fill="none" stroke="#e31e24" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="58" textAnchor="middle" className="fill-white/40 font-mono text-[6px] font-black tracking-[0.3em]">MAHINDRA</text>
      </svg>
    );
  }

  if (normalized.includes("ltimindtree") || normalized.includes("lti") || normalized.includes("mindtree")) {
    return (
      <svg viewBox="0 0 100 60" className="w-full h-full max-h-[85%] max-w-[85%]" fill="none">
        <path d="M15 15 H48 V42 H15 Z" fill="#ed1c24" opacity="0.8" />
        <path d="M38 23 H80 V35 H38 Z" fill="#004b8d" opacity="0.8" />
        <circle cx="48" cy="28" r="12" fill="#ed1c24" />
        <circle cx="48" cy="28" r="6" fill="#004b8d" />
      </svg>
    );
  }

  if (normalized.includes("cognizant")) {
    return (
      <svg viewBox="0 0 80 50" className="w-full h-full max-h-[85%] max-w-[85%]">
        <path d="M15 12 L35 12 L25 38 L5 38 Z" fill="#005696" />
        <path d="M38 12 L68 12 L58 38 L28 38 Z" fill="#0033a0" opacity="0.8" />
        <path d="M25 38 L45 38 L55 12 L35 12 Z" fill="#0033a0" />
      </svg>
    );
  }

  if (normalized.includes("mphasis")) {
    return (
      <svg viewBox="0 0 80 55" className="w-full h-full max-h-[85%] max-w-[85%]">
        <circle cx="40" cy="27" r="18" fill="none" stroke="#ffffff" strokeWidth="5" opacity="0.2" />
        <circle cx="40" cy="27" r="18" fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="40 100" />
        <path d="M40 9 A18 18 0 0 1 58 27" fill="none" stroke="#FF5E00" strokeWidth="5" strokeLinecap="round" />
        <text x="40" y="32" textAnchor="middle" className="font-sans font-black text-[13px] fill-white tracking-widest">M</text>
      </svg>
    );
  }

  if (normalized.includes("accenture")) {
    return (
      <svg viewBox="0 0 120 40" className="w-full h-full max-h-[85%] max-w-[85%]">
        <text x="15" y="27" className="font-sans font-black text-[19px] fill-white tracking-tighter">accenture</text>
        <path d="M102 12 L110 20 L102 28" fill="none" stroke="#a100ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalized.includes("zoho")) {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full max-h-[75%] max-w-[75%]">
        <rect x="3" y="3" width="11" height="11" rx="2" fill="#e31e24" />
        <rect x="18" y="3" width="11" height="11" rx="2" fill="#007cc3" />
        <rect x="3" y="18" width="11" height="11" rx="2" fill="#7fba00" />
        <rect x="18" y="18" width="11" height="11" rx="2" fill="#ffb900" />
      </svg>
    );
  }

  return null;
};

const LogoImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const svgLogo = getCompanySVG(src, alt);

  return (
    <div className={cn("relative flex items-center justify-center w-full h-full select-none", className)}>
      {svgLogo ? (
        svgLogo
      ) : error || !src ? (
        <div className="flex flex-col items-center justify-center text-white/10 w-full h-full">
          <Building2 className="w-8 h-8 sm:w-10 sm:h-10 mb-1 opacity-40" />
          <span className="text-[6px] font-black uppercase tracking-tighter opacity-30 text-center px-1 line-clamp-1">{alt}</span>
        </div>
      ) : (
        <>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse rounded-xl">
              <div className="w-4 h-4 border-2 border-white/10 border-t-orange-500 rounded-full animate-spin" />
            </div>
          )}
          <img 
            src={src} 
            alt={alt} 
            className={cn(
              "max-h-[85%] max-w-[85%] object-contain transition-all duration-700 pointer-events-none",
              loaded ? "opacity-100 scale-100" : "opacity-0 scale-90",
            )}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        </>
      )}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, user }) => {
  const [resumeOrJD, setResumeOrJD] = useState('');
  const [persona, setPersona] = useState<InterviewerPersona>('Friendly');
  const [activeCompany, setActiveCompany] = useState(companies[5]); // Default to Google
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'MAANG' | 'Service' | 'Consulting' | 'Product'>('All');
  const [companyTab, setCompanyTab] = useState<'details' | 'stats'>('details');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDomainClick = (domain: Domain) => {
    if (domain === 'Personalized' && resumeOrJD.trim().length <= 10) {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // Check if the domain is one of our predefined companies to use its inherent difficulty
    const companyDifficulty = companies.find(c => c.name === domain)?.difficulty || 'Medium';
    
    onStart(domain, resumeOrJD, companyDifficulty, persona);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 overflow-x-hidden">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 sm:mb-20 max-w-4xl relative w-full"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] sm:text-sm font-bold mb-6"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Welcome back, {user.displayName || user.email?.split('@')[0]}!
          </motion.div>
        )}

        <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20 leading-[0.9]">
          MASTER THE <br className="hidden sm:block" /> INTERVIEW
        </h1>
        
        <p className="text-base sm:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed px-4">
          The world's most advanced AI-powered interview simulator. 
          <span className="text-white"> Real-time feedback, industry-specific paths.</span>
        </p>
      </motion.div>

      {/* Resume/JD Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-4xl bg-[#0d0e12] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 mb-16 sm:mb-24 relative overflow-hidden group shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
            <FileText className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Personalized Simulation</h2>
            <p className="text-sm text-gray-500 font-medium">Upload your profile for a tailored experience</p>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={resumeOrJD}
          onChange={(e) => setResumeOrJD(e.target.value)}
          placeholder="Paste your resume or job description here..."
          className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 min-h-[150px] focus:outline-none focus:border-orange-500/50 transition-all resize-none text-sm sm:text-base font-mono mb-6 placeholder:text-gray-700"
        />

        <div className="flex flex-col gap-4">
          {resumeOrJD.trim().length > 0 && resumeOrJD.trim().length <= 20 && (
            <p className="text-orange-500 text-xs font-mono animate-pulse">
              Please paste a bit more content (at least 20 characters) for a better interview...
            </p>
          )}
          
          <motion.button
            disabled={resumeOrJD.trim().length <= 10}
            onClick={() => onStart('Personalized', resumeOrJD, 'Medium', persona)}
            className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all group shadow-xl ${
              resumeOrJD.trim().length > 10 
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${resumeOrJD.trim().length > 10 ? 'group-hover:rotate-12' : ''} transition-transform`} />
            Start Personalized Interview
            <Play className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Interviewer Persona Selector */}
      <div className="w-full max-w-4xl mb-16 sm:mb-24 flex flex-col items-center gap-6 sm:gap-8">
        <div className="flex items-center gap-3">
          <UserIcon className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl sm:text-2xl font-bold">Choose Your Interviewer</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {[
            { id: 'Friendly', icon: <Sparkles className="w-5 h-5" />, desc: 'Encouraging & Supportive', color: 'blue' },
            { id: 'Stern', icon: <ShieldAlert className="w-5 h-5" />, desc: 'Strict & Formal', color: 'red' },
            { id: 'Technical Expert', icon: <Microscope className="w-5 h-5" />, desc: 'Deep Technical Dive', color: 'purple' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPersona(p.id as InterviewerPersona)}
              className={cn(
                "p-6 rounded-3xl border transition-all text-left flex flex-col gap-3 relative overflow-hidden group",
                persona === p.id 
                  ? `bg-${p.color}-500/10 border-${p.color}-500/50 ring-2 ring-${p.color}-500/20` 
                  : "bg-[#151619] border-white/10 hover:border-white/20"
              )}
            >
              <div className={cn(
                "p-2 w-fit rounded-xl transition-colors",
                persona === p.id ? `bg-${p.color}-500 text-white` : "bg-white/5 text-gray-500"
              )}>
                {p.icon}
              </div>
              <div>
                <div className={cn(
                  "font-bold text-lg",
                  persona === p.id ? "text-white" : "text-gray-400"
                )}>{p.id}</div>
                <div className="text-xs text-gray-500 font-medium">{p.desc}</div>
              </div>
              {persona === p.id && (
                <motion.div 
                  layoutId="persona-active"
                  className={cn("absolute top-0 right-0 p-2", `text-${p.color}-500`)}
                >
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Interview Command Center: Modern Bento Dashboard */}
      <div className="w-full max-w-7xl mb-24 sm:mb-32 px-4">
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4"
          >
            <Briefcase className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Mission Control</span>
          </motion.div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-4">
            Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Command Center</span>
          </h2>
          <p className="text-gray-500 max-w-2xl text-lg">
            Select an organization to initialize a high-fidelity interview simulation tailored to their specific engineering culture.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          {/* Left: Tactical Selection Hub */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6">
            {/* Search & Filters */}
            <div className="space-y-4 p-5 bg-[#0d0e12] border border-white/5 rounded-[2rem] shadow-xl">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Scan for organization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 pl-10 text-xs focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-700 font-medium"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  <UserPlus className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {['All', 'MAANG', 'Service', 'Consulting', 'Product'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border",
                      activeCategory === cat 
                        ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20" 
                        : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Selection Grid */}
            <div className="flex-1 overflow-y-auto max-h-[550px] pr-2 custom-scrollbar">
              <div className="grid grid-cols-3 gap-3">
                {filteredCompanies.map((company, index) => (
                  <motion.button
                    key={company.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => {
                      if (activeCompany.name === company.name) {
                        handleDomainClick(company.name);
                      } else {
                        setActiveCompany(company);
                      }
                    }}
                    className={cn(
                      "group relative aspect-square rounded-[1.5rem] border transition-all duration-300 flex flex-col items-center justify-center p-2",
                      activeCompany.name === company.name 
                        ? "bg-white/5 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.05)]" 
                        : "bg-[#0d0e12] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 flex items-center justify-center transition-all duration-500",
                      activeCompany.name === company.name ? "scale-110" : "grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100"
                    )}>
                      <LogoImage src={company.logo} alt={company.name} />
                    </div>
                    
                    <div className={cn(
                      "mt-2 text-[7px] font-black uppercase tracking-widest transition-colors text-center w-full truncate px-1",
                      activeCompany.name === company.name ? "text-white" : "text-gray-600 group-hover:text-gray-400"
                    )}>
                      {company.name}
                    </div>

                    {activeCompany.name === company.name && (
                      <motion.div 
                        layoutId="active-grid-indicator"
                        className="absolute inset-0 border-2 border-orange-500 rounded-[1.5rem] pointer-events-none"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              
              {filteredCompanies.length === 0 && (
                <div className="py-10 text-center text-gray-700 text-[10px] font-black uppercase tracking-[0.2em]">
                  No Protocol Found
                </div>
              )}
            </div>
          </div>

          {/* Right: Mission Briefing Panel */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCompany.name}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative h-full min-h-[500px] bg-[#0d0e12] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 overflow-hidden flex flex-col shadow-2xl"
              >
                {/* Background Effects */}
                <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
                <div 
                  className="absolute -top-24 -right-24 w-96 h-96 blur-[120px] opacity-20 transition-colors duration-1000"
                  style={{ backgroundColor: activeCompany.color }}
                />
                
                {/* Tactical Watermark Logo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.03] pointer-events-none filter blur-[2px] transition-all duration-1000">
                  <LogoImage src={activeCompany.logo} alt="" className="w-full h-full object-contain scale-[1.5]" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-8">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full opacity-50" />
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-white/5 border border-white/10 p-6 flex items-center justify-center backdrop-blur-xl shadow-inner relative z-10">
                          <LogoImage src={activeCompany.logo} alt={activeCompany.name} className="scale-110" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-5xl sm:text-7xl font-black tracking-tighter text-white leading-none mb-3">
                          {activeCompany.name}
                        </h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Identity Verified</span>
                          </div>
                          <span className="text-gray-600">|</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Tier 1 Protocol</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Difficulty Rating</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div 
                            key={step}
                            className={cn(
                              "w-6 h-1.5 rounded-full transition-all duration-500",
                              step <= (activeCompany.difficulty === 'Hard' ? 5 : activeCompany.difficulty === 'Medium' ? 3 : 2)
                                ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                                : "bg-white/5"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Segmented Controller (Details vs Key Stats) */}
                  <div className="flex border-b border-white/5 mb-8">
                    <button
                      onClick={() => setCompanyTab('details')}
                      className={cn(
                        "pb-4 px-6 text-xs font-black uppercase tracking-[0.22em] transition-all relative",
                        companyTab === 'details' ? "text-orange-500" : "text-gray-500 hover:text-gray-300"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <ClipboardList className="w-3.5 h-3.5" /> Company Details
                      </span>
                      {companyTab === 'details' && (
                        <motion.div
                          layoutId="active-brief-tab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                        />
                      )}
                    </button>
                    <button
                      onClick={() => setCompanyTab('stats')}
                      className={cn(
                        "pb-4 px-6 text-xs font-black uppercase tracking-[0.22em] transition-all relative",
                        companyTab === 'stats' ? "text-orange-500" : "text-gray-500 hover:text-gray-300"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5" /> Key Stats & Metrics
                      </span>
                      {companyTab === 'stats' && (
                        <motion.div
                          layoutId="active-brief-tab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                        />
                      )}
                    </button>
                  </div>

                  {companyTab === 'details' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                            <Brain className="w-3 h-3" /> Mission Brief
                          </h4>
                          <p className="text-gray-400 text-lg leading-relaxed font-medium">
                            {activeCompany.description}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {activeCompany.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-bold text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">System Parameters</h4>
                          <Settings className="w-3 h-3 text-gray-500" />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-xs text-gray-400">Questions</span>
                            <span className="text-xs font-bold text-white">10 Rounds</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-xs text-gray-400">Time Limit</span>
                            <span className="text-xs font-bold text-white">20 Minutes</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-xs text-gray-400">Feedback</span>
                            <span className="text-xs font-bold text-white">Real-time AI</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                            <LineChart className="w-3.5 h-3.5" /> Core Target Topics
                          </h4>
                          <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                            These high-density domains form the bulk of assessment checkpoints under current protocol vectors:
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          {getCompanyStats(activeCompany).topics.map((topic, i) => (
                            <div key={topic} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                              <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 w-5 h-5 rounded-md flex items-center justify-center">
                                0{i + 1}
                              </span>
                              <span className="text-xs font-bold text-white tracking-wide">{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Telemetry Data</h4>
                            <PieChart className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Acceptance Rate</div>
                              <div className="text-xl font-black text-orange-500">{getCompanyStats(activeCompany).acceptanceRate}</div>
                            </div>
                            
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Process Duration</div>
                              <div className="text-xs font-black text-white leading-tight mt-1">{getCompanyStats(activeCompany).duration}</div>
                            </div>
                            
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 col-span-2">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Est. Compensation Tier</div>
                              <div className="text-xs font-bold text-white mt-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {getCompanyStats(activeCompany).ctcFocus}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 mt-4">
                          <div className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Assessment Flow</div>
                          <div className="text-[11px] text-gray-300 font-semibold leading-relaxed">
                            {getCompanyStats(activeCompany).pattern}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-8 border-t border-white/5">
                    <button
                      onClick={() => handleDomainClick(activeCompany.name)}
                      className="w-full py-6 rounded-[2rem] font-black text-white uppercase tracking-[0.4em] transition-all relative overflow-hidden group/btn shadow-2xl"
                      style={{ backgroundColor: activeCompany.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-10 flex items-center justify-center gap-4 text-sm">
                        Initialize Simulation <Zap className="w-5 h-5 fill-current" />
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Code className="w-6 h-6 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Technical & Behavioral Domains</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain, index) => (
            <motion.button
              key={domain.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleDomainClick(domain.name)}
              className="group relative p-6 rounded-2xl bg-[#151619] border border-white/10 hover:border-orange-500/50 transition-all text-left overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {domain.icon}
                </div>
                <h3 className="text-lg font-semibold leading-tight">{domain.name}</h3>
              </div>
              <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors line-clamp-2">
                {domain.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Start Interview <Play className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-6xl mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Terminal className="w-6 h-6 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Coding Practice (Quizzes)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {codingQuizzes.map((quiz, index) => (
            <motion.button
              key={quiz.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleDomainClick(quiz.name)}
              className="group relative p-6 rounded-2xl bg-[#151619] border border-white/10 hover:border-orange-500/50 transition-all text-left overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {quiz.icon}
                </div>
                <h3 className="text-lg font-semibold leading-tight">{quiz.name}</h3>
              </div>
              <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors line-clamp-2">
                {quiz.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Start Quiz <Play className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <footer className="mt-16 text-gray-500 text-sm font-medium tracking-wide">
        Powered by SCT • Real-time Speech Recognition • Adaptive Learning
      </footer>
    </div>
  );
};
