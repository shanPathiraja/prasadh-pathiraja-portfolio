'use client';

import { useState, type FormEvent } from 'react';
import { SOCIALS } from './Nav';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  const buttonLabel =
    status === 'sending'
      ? 'Sending…'
      : status === 'sent'
        ? 'Message sent'
        : status === 'error'
          ? 'Try again'
          : 'Send message';

  return (
    <section className="contact section-pad" id="contact">
      <div className="contact-title">
        <p className="eyebrow">05 / Let’s make something useful</p>
        <h2>
          Have a hard
          <br />
          problem?
        </h2>
        <p className="contact-script">I’m listening.</p>
        <div className="contact-links">
          <a href={`mailto:${SOCIALS.email}`}>
            <span aria-hidden="true">↗</span>
            <span>
              Email me<small>{SOCIALS.email}</small>
            </span>
          </a>
          <a href={SOCIALS.github} target="_blank" rel="noreferrer">
            <span aria-hidden="true">GH</span>
            <span>
              GitHub<small>See the code</small>
            </span>
          </a>
          <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer">
            <span aria-hidden="true">IN</span>
            <span>
              LinkedIn<small>Let’s connect</small>
            </span>
          </a>
        </div>
      </div>

      <form className="contact-form" onSubmit={submit}>
        <label>
          <span>01 / Your name</span>
          <input name="name" placeholder="How should I call you?" required />
        </label>
        <label>
          <span>02 / Email address</span>
          <input name="email" type="email" placeholder="you@company.com" required />
        </label>
        <label>
          <span>03 / What are we building?</span>
          <textarea
            name="message"
            rows={4}
            placeholder="Tell me a little about the project, team, or problem..."
            required
          />
        </label>
        <button className="send-button" type="submit" disabled={status === 'sending'}>
          <span>{buttonLabel}</span>
          <span aria-hidden="true">→</span>
        </button>
        {status === 'sent' && (
          <p className="form-note" role="status">
            Thanks — I’ll get back to you shortly.
          </p>
        )}
        {status === 'error' && (
          <p className="form-note" role="status">
            Something went wrong. Email me directly at {SOCIALS.email}.
          </p>
        )}
      </form>
    </section>
  );
}
