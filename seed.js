const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const users = [
  {
    name: "Alex Rivera",
    email: "alex@example.com",
    bio: "Full-stack architect. Passionate about AI and scalable systems.",
    university: "Stanford University",
    classYear: "2024",
    skills: ["React", "Node.js", "Python", "Docker"],
    domain: "Software Engineering",
    isMentor: true,
    mentorCategory: "Tech",
    rating_avg: 4.9,
    sessionsCount: 24,
    trustScore: 98,
    availability: "AVAILABLE",
    intent: "SERIOUS",
    projects: [
      { title: "NeuralNet OS", tech: ["C++", "Python"], repoUrl: "https://github.com/alex/neural-os" },
      { title: "EcoTrack", tech: ["React Native"], repoUrl: "https://github.com/alex/ecotrack" }
    ]
  },
  {
    name: "Sophia Chen",
    email: "sophia@example.com",
    bio: "UX Researcher & UI Designer. Focus on human-centric design.",
    university: "MIT",
    classYear: "2025",
    skills: ["Figma", "Interaction Design", "Prototyping"],
    domain: "Product Design",
    isMentor: true,
    mentorCategory: "Design",
    rating_avg: 4.8,
    sessionsCount: 18,
    trustScore: 95,
    availability: "COLLABORATION",
    intent: "EXPLORING",
    projects: [
      { title: "Glass UI Kit", tech: ["Figma"], repoUrl: "https://figma.com/sophia/glass" }
    ]
  },
  {
    name: "Marcus Thorne",
    email: "marcus@example.com",
    bio: "Serial entrepreneur. Founded 2 startups. Here to mentor.",
    university: "Harvard University",
    classYear: "2023",
    skills: ["Pitching", "Fundraising", "GTM Strategy"],
    domain: "Entrepreneurship",
    isMentor: true,
    mentorCategory: "Startup",
    rating_avg: 5.0,
    sessionsCount: 42,
    trustScore: 99,
    availability: "BUSY",
    intent: "SERIOUS",
    projects: []
  },
  {
    name: "Liam Walsh",
    email: "liam@example.com",
    bio: "Cybersecurity enthusiast and CTF player.",
    university: "Georgia Tech",
    classYear: "2026",
    skills: ["Penetration Testing", "Go", "Rust"],
    domain: "Security",
    isMentor: false,
    trustScore: 88,
    availability: "AVAILABLE",
    intent: "HACKATHON",
    projects: [
      { title: "VulnScanner", tech: ["Go"], repoUrl: "https://github.com/liam/vuln" }
    ]
  },
  {
    name: "Elena Rodriguez",
    email: "elena@example.com",
    bio: "Marketing strategist for tech startups.",
    university: "UC Berkeley",
    classYear: "2025",
    skills: ["SEO", "Content Strategy", "Growth"],
    domain: "Marketing",
    isMentor: true,
    mentorCategory: "Marketing",
    rating_avg: 4.7,
    sessionsCount: 15,
    trustScore: 92,
    availability: "AVAILABLE",
    intent: "EXPLORING",
    projects: []
  }
];

const posts = [
  {
    content: "Just launched the beta for NeuralNet OS! Looking for testers interested in AI-driven kernels. #AI #OS",
    authorName: "Alex Rivera",
    upvotes: 156,
    authorId: "temp_alex",
    createdAt: new Date().toISOString()
  },
  {
    content: "Who's heading to hackMIT this weekend? Looking for a backend partner for a fintech project! 🚀",
    authorName: "Sophia Chen",
    upvotes: 89,
    authorId: "temp_sophia",
    createdAt: new Date().toISOString()
  },
  {
    content: "Pitch deck tip: Focus on the 'Why Now' slide. Investors are looking for market timing more than ever.",
    authorName: "Marcus Thorne",
    upvotes: 245,
    authorId: "temp_marcus",
    createdAt: new Date().toISOString()
  }
];

const events = [
  {
    title: "Global AI Summit 2026",
    date: "2026-05-15",
    location: "San Francisco / Virtual",
    description: "The largest gathering of AI builders and researchers.",
    type: "HACKATHON",
    link: "https://mlh.io/seasons/2026/events"
  },
  {
    title: "Founders Meetup: NY",
    date: "2026-04-10",
    location: "New York City",
    description: "Informal networking for early-stage founders.",
    type: "MEETUP",
    link: "https://www.meetup.com/ny-founders/"
  }
];

const colleges = [
  { name: "Stanford University", studentCount: 1200, location: "USA" },
  { name: "MIT", studentCount: 950, location: "USA" },
  { name: "Georgia Tech", studentCount: 1500, location: "USA" },
  { name: "IIT Bombay", studentCount: 2000, location: "India" }
];

const leaderboards = [
  { name: "Marcus Thorne", score: 9900, rank: 1, domain: "Entrepreneurship" },
  { name: "Alex Rivera", score: 9800, rank: 2, domain: "Software" },
  { name: "Ishaan Gupta", score: 9500, rank: 3, domain: "Design" }
];

async function seed() {
  console.log("🚀 Starting High-Fidelity Seeding...");
  try {
    // 1. Seed Users
    for (const u of users) {
      const userRef = await db.collection('users').add(u);
      console.log(`✅ Seeded User: ${u.name}`);
    }

    // 2. Seed Posts
    for (const p of posts) {
      await db.collection('community_posts').add(p);
      console.log(`✅ Seeded Post by ${p.authorName}`);
    }

    // 3. Seed Events
    for (const e of events) {
      await db.collection('events').add(e);
      console.log(`✅ Seeded Event: ${e.title}`);
    }

    // 4. Seed Colleges
    for (const c of colleges) {
      await db.collection('colleges').add(c);
      console.log(`✅ Seeded College: ${c.name}`);
    }

    // 5. Seed Leaderboards
    for (const l of leaderboards) {
      await db.collection('leaderboard').add(l);
      console.log(`✅ Seeded Leaderboard Entry: ${l.name}`);
    }

    console.log("\n✨ Seeding completed successfully! Ecosystem is live.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
