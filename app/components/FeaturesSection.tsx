"use client";

import { useEffect, useRef } from "react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
}

const features: Feature[] = [
  {
    tag: "Sensor",
    title: "24.5MP BSI CMOS",
    description:
      "A back-illuminated full-frame sensor that captures extraordinary detail in any light condition — from golden hour to deep night.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    tag: "Autofocus",
    title: "Subject Detection AF",
    description:
      "AI-powered autofocus detects and locks onto people, animals, vehicles, and aircraft with uncanny precision — never miss the decisive moment.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    tag: "Video",
    title: "8K RAW Video",
    description:
      "Capture cinema-grade footage at 8K resolution with N-RAW and ProRes RAW HQ support. The future of filmmaking, in your hands.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    tag: "Stabilization",
    title: "8-Stop IBIS",
    description:
      "In-body image stabilization compensates for up to 8 stops of camera shake. Shoot handheld in conditions that were once impossible.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative border border-white/5 bg-white/[0.02] rounded-sm p-7 hover:border-[#c8a84e]/20 hover:bg-white/[0.04] transition-all duration-500"
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s, border-color 0.3s, background-color 0.3s`,
      }}
    >
      {/* Tag */}
      <p className="text-[#c8a84e] text-[10px] tracking-[0.3em] uppercase font-mono mb-4">
        {feature.tag}
      </p>

      {/* Icon */}
      <div className="w-10 h-10 rounded-sm border border-white/8 flex items-center justify-center text-white/40 group-hover:text-[#c8a84e] group-hover:border-[#c8a84e]/20 transition-all duration-300 mb-5">
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="text-white text-lg font-medium tracking-tight mb-3">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-white/35 text-sm leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export default function FeaturesSection() {
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="relative py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div
          ref={headingRef}
          className="mb-16"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p className="text-[#c8a84e] text-xs tracking-[0.3em] uppercase font-mono mb-4">
            Engineering
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white max-w-lg leading-tight">
            Every detail,{" "}
            <span className="text-white/30">engineered to perfection.</span>
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.tag} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
