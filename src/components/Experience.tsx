'use client';

import { useState } from 'react';
import Reveal from './Reveal';

type Link = { label: string; href: string; icon: 'appstore' | 'playstore' | 'web' };

type Project = {
  name: string;
  subtitle: string;
  tags: string[];
  bullets: string[];
  links?: Link[];
};

const experiences: {
  role: string;
  company: string;
  period: string;
  summary: string;
  projects: Project[];
  contributions: string[];
}[] = [
  {
    role: 'Software Engineer',
    company: 'Fcode Labs (Pvt) Ltd',
    period: '2022 – Present',
    summary:
      'Built full-stack JavaScript/TypeScript features end-to-end across multiple client-facing products. Made deliberate architectural calls on build-vs-buy, favouring maintainable, self-understood code over bolted-on libraries.',
    projects: [
      {
        name: 'Bevisioneers',
        subtitle: 'AI Coaching Platform for Young Entrepreneurs',
        tags: ['Next.js', 'NestJS', 'Python FastAPI', 'GCP', 'RAG'],
        bullets: [
          'Worked as a full-stack developer building frontend functionalities using React.js and backend APIs and services using NestJS.',
          'Developed AI-powered backend services using Python FastAPI, integrating frontend, backend, and AI services for seamless system functionality.',
          'Engineered a full RAG pipeline using embeddings, semantic search, OCR, and PDF extraction — built from first principles rather than a pre-built framework.',
          'Worked with Google Cloud Platform (GCP) services including Cloud SQL and cloud infrastructure management.',
          'Contributed to cloud computing architecture, deployment processes, and backend scalability improvements on GCP.',
        ],
        links: [
          { label: 'Live Site', href: 'https://chatbot.bevisioneers.world/login', icon: 'web' },
        ],
      },
      {
        name: 'Gemlux',
        subtitle: 'Gemstone Scanning SaaS — Custom Device + Cloud Platform',
        tags: ['React', 'NestJS', 'AWS', 'Stripe', 'Multi-Tenant'],
        bullets: [
          'Designed and developed backend services and APIs; migrated backend systems into a monorepo architecture.',
          'Implemented multi-user role management, access control systems, and subscription management with Stripe payment integration.',
          'Managed AWS cloud infrastructure using Cognito, EC2, API Gateway, Lambda, S3, and DynamoDB.',
          'Applied secure multi-tenant database access management and contributed to project architecture and system scalability improvements.',
        ],
        links: [
          { label: 'Live Site', href: 'https://gemlux.porolis.com/', icon: 'web' },
        ],
      },
      {
        name: 'Hani',
        subtitle: 'AI Hotel & Travel Discovery — iOS Flutter App',
        tags: ['Flutter', 'BLoC', 'NestJS', 'Geolocation', 'App Store'],
        bullets: [
          'Contributed to Flutter mobile application development using BLoC architecture, recommending nearby hotels and travel destinations within a user-defined area radius.',
          'Developed backend services using NestJS and integrated backend APIs with the Flutter mobile application.',
          'Implemented location-based recommendation functionality and worked on state management, UI integration, and application performance improvements.',
          'Managed application deployment through TestFlight and Apple App Store.',
        ],
        links: [
          { label: 'App Store', href: 'https://apps.apple.com/fr/app/hani-your-lifestyle-assistant/id6450742078?l=en-GB', icon: 'appstore' },
        ],
      },
      {
        name: 'Personal Coaching App',
        subtitle: 'AI-Powered Mobile App with Real-Time Progress Tracking',
        tags: ['Flutter', 'BLoC', 'NestJS', 'WebSocket', 'AWS'],
        bullets: [
          'Contributed to Flutter mobile application development and maintained backend functionalities and API integrations.',
          'Implemented real-time data synchronization and live progress tracking features using WebSocket communication with AWS services.',
          'Developed notification handling and backend integrations; contributed to bug fixing and feature improvements in the React frontend.',
          'Participated in application deployment to Google Play Store and Apple App Store.',
        ],
        links: [
          { label: 'Play Store', href: 'https://play.google.com/store/apps/details?id=com.progressmagic&hl=en_SG', icon: 'playstore' },
        ],
      },
      {
        name: 'Lynq by Fcode',
        subtitle: 'Organisation Workflow & Employee Management Platform',
        tags: ['AWS Lambda', 'WebSocket', 'DynamoDB', 'API Gateway'],
        bullets: [
          'Developed AWS Lambda-based microservices and implemented WebSocket interfaces for real-time synchronization.',
          'Worked with AWS API Gateway and DynamoDB; contributed to scalable cloud-native backend architecture.',
        ],
      },
      {
        name: 'CPO2M3',
        subtitle: 'ERP Core Tool for Apparel Order Management',
        tags: ['TypeScript', 'GraphQL', 'Microservices', 'OCR'],
        bullets: [
          'CPO2M3 is an ERP core software tool designed for apparel manufacturers to process, validate, and manage customer orders — used by merchandising staff to digitally transform and streamline the entire order lifecycle.',
          'Built order processing tools for merchandisers to input and validate customer orders, plus real-time order tracking and status management.',
          'Architected GraphQL microservice communication and cloud-based deployment; implemented system integration to sync order data across the broader manufacturing infrastructure, reducing errors and improving operational efficiency.',
        ],
      },
    ],
    contributions: [
      'Participated in technical discussions with both engineering team members and external stakeholders, translating requirements into clear architectural decisions.',
      'Conducted code reviews and wrote technical documentation, focusing on long-term maintainability.',
      'Mentored 2–3 engineering interns on clean code principles, component architecture, and thoughtful API design.',
    ],
  },
  {
    role: 'Associate Software Engineer',
    company: 'Syntax Genie (Pvt) Ltd',
    period: '2021 – 2022',
    summary:
      'Contributed to full-stack JavaScript and Java development across enterprise, education, and energy domains, building custom frontend components and REST APIs for client-facing platforms.',
    projects: [
      {
        name: 'Scrapbook',
        subtitle: 'Cloud-Based Learning Management System',
        tags: ['React', 'Node.js', 'Firebase Cloud Functions'],
        bullets: [
          'Built custom React components for course tracking, content management, and authentication flows — prioritising a hand-built, lightweight frontend over a pre-built admin template.',
        ],
        links: [
          { label: 'Live Site', href: 'https://scrapbook-public-website.vercel.app/', icon: 'web' },
        ],
      },
      {
        name: 'IEEE IRP Platform',
        subtitle: 'Enterprise Resource Planning System',
        tags: ['React', 'Next.js', 'Spring Boot'],
        bullets: [
          'Developed React admin dashboards and a Next.js public-facing website, building reusable component patterns shared across both surfaces.',
          'Authored data migration utilities to extract, transform, and load legacy data into the new platform with zero data loss.',
        ],
        links: [
          { label: 'Admin Portal', href: 'https://irp-portal.ieee.org/sso', icon: 'web' },
          { label: 'Public Site', href: 'https://irp.ieee.org/sso', icon: 'web' },
        ],
      },
      {
        name: 'Meemure',
        subtitle: 'Client Website',
        tags: ['React', 'CI/CD'],
        bullets: [
          'Designed and developed the client-facing website for Meemure, delivering a clean, responsive web presence.',
        ],
        links: [
          { label: 'Live Site', href: 'https://meemure.com/', icon: 'web' },
        ],
      },
      {
        name: 'Altavision Solar',
        subtitle: 'Automated Solar Quotation System',
        tags: ['React', 'Firebase Cloud Functions', 'CI/CD'],
        bullets: [
          'Developed the front-end interface for an automated solar quotation system, integrating with backend calculation logic built on Firebase Cloud Functions.',
          'Implemented PDF generation pipeline for a seamless end-to-end user flow from configuration to downloadable quote.',
        ],
      },
    ],
    contributions: [],
  },
];

function LinkIcon({ icon }: { icon: Link['icon'] }) {
  if (icon === 'appstore') return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
  if (icon === 'playstore') return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M3.18 23.76c.3.17.65.19.96.04l13.45-7.76-2.93-2.93-11.48 10.65zM.54 1.18C.2 1.53 0 2.08 0 2.8v18.4c0 .72.2 1.27.54 1.62l.08.08 10.31-10.31v-.24L.62 1.1l-.08.08zM20.6 10.27l-2.77-1.6-3.14 3.14 3.14 3.14 2.79-1.61c.8-.46.8-1.21-.02-1.67zM3.18.24L16.63 8l-2.93 2.93L3.18.32V.24z"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-400/30 hover:shadow-lg hover:shadow-violet-950/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold text-sm">{project.name}</p>
            {project.links?.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                <LinkIcon icon={l.icon} />
                {l.label}
              </a>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-0.5">{project.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          <div className="hidden sm:flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                {t}
              </span>
            ))}
          </div>
          <svg
            className={`w-4 h-4 text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="flex flex-wrap gap-1.5 mt-4 mb-4 sm:hidden">
            {project.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                {t}
              </span>
            ))}
          </div>
          <ul className="space-y-2.5 mt-4">
            {project.bullets.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="relative py-28 px-6 max-w-5xl mx-auto">
      <Reveal className="mb-16">
        <p className="section-label mb-3">Career</p>
        <h2
          className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          style={{ fontFamily: 'var(--font-grotesk)' }}
        >
          Work Experience
        </h2>
      </Reveal>

      <div className="relative">
        <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-400/40 via-violet-500/20 to-transparent hidden md:block" />

        <div className="space-y-16">
          {experiences.map((exp, expIdx) => (
            <Reveal key={exp.company} direction="left" delay={expIdx * 80} threshold={0.08}>
              <div className="md:pl-20 relative">
                <div className="hidden md:flex absolute left-5 top-1 w-6 h-6 rounded-full bg-[#050510] border-2 border-violet-500/60 items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.5)]">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-grotesk)' }}>
                      {exp.role}
                    </h3>
                    <p className="text-cyan-300 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-sm text-white/50 glass px-3 py-1 rounded-full self-start sm:self-auto whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>

                <p className="text-white/50 text-sm leading-relaxed mb-6">{exp.summary}</p>

                <div className="space-y-3 mb-6">
                  {exp.projects.map((p, pIdx) => (
                    <Reveal key={p.name} delay={pIdx * 60} threshold={0.05}>
                      <ProjectCard project={p} />
                    </Reveal>
                  ))}
                </div>

                {exp.contributions.length > 0 && (
                  <Reveal>
                    <div className="glass rounded-xl px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Team Contributions</p>
                      <ul className="space-y-2">
                        {exp.contributions.map((c, i) => (
                          <li key={i} className="flex gap-3 text-sm text-white/50 leading-relaxed">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-400/60 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
