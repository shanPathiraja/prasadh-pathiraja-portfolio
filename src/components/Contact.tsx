'use client';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import Reveal from './Reveal';

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? 'sent' : 'idle');
  };

  const socials = [
    { icon: Mail, label: 'Email', href: 'mailto:prasadh.pathiraja@gmail.com', text: 'prasadh.pathiraja@gmail.com' },
    { icon: GithubIcon, label: 'GitHub', href: 'https://github.com/shanPathiraja', text: 'github.com/shanPathiraja' },
    { icon: LinkedinIcon, label: 'LinkedIn', href: 'https://www.linkedin.com/in/prasadh-pathiraja-a64b7aba/', text: 'linkedin.com/in/prasadh-pathiraja' },
  ];

  const inputClass =
    'glass text-white placeholder-white/30 focus:border-cyan-400/50 focus:bg-cyan-400/[0.04] rounded-xl px-4 py-3 outline-none transition-all';

  return (
    <section id="contact" className="relative py-28 px-6 max-w-5xl mx-auto">
      <Reveal className="mb-16">
        <p className="section-label mb-3">Contact</p>
        <h2
          className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-grotesk)' }}
        >
          Let&apos;s Work Together
        </h2>
        <p className="text-white/45 max-w-md">
          Have a project in mind or just want to say hi? My inbox is always open.
        </p>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-12">
        <Reveal direction="left" delay={100}>
          <div className="flex flex-col gap-6 justify-center">
            {socials.map(({ icon: Icon, label, href, text }, i) => (
              <Reveal key={label} delay={i * 80} direction="left">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 group"
                >
                  <div className="w-11 h-11 rounded-xl glass group-hover:border-cyan-400/40 group-hover:bg-cyan-400/[0.06] group-hover:shadow-[0_0_20px_rgba(103,232,249,0.2)] flex items-center justify-center transition-all duration-200">
                    <Icon size={18} className="text-white/50 group-hover:text-cyan-300 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
                    <p className="text-white/80 group-hover:text-white transition-colors text-sm">{text}</p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal direction="right" delay={150}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="email"
              placeholder="your@email.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
            <textarea
              placeholder="Tell me about your project..."
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClass} resize-none`}
            />
            <button
              type="submit"
              disabled={status !== 'idle'}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:brightness-110 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Message sent!' : <><Send size={16} /> Send Message</>}
            </button>
          </form>
        </Reveal>
      </div>

      <Reveal delay={200} className="mt-20 pt-8 border-t border-white/5">
        <p className="text-white/30 text-center text-sm">
          © {new Date().getFullYear()} Prasadh Pathiraja. Built with Next.js, Three.js &amp; Tailwind CSS.
        </p>
      </Reveal>
    </section>
  );
}
