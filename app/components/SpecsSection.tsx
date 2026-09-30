"use client";

import { useEffect, useRef } from "react";

const specs = [
  {
    category: "Image Sensor",
    items: [
      { label: "Type", value: "35.9 × 23.9 mm BSI CMOS" },
      { label: "Resolution", value: "24.5 Megapixels" },
      { label: "ISO Range", value: "100 – 64,000 (ext. 204,800)" },
      { label: "Color Depth", value: "14-bit RAW" },
    ],
  },
  {
    category: "Autofocus",
    items: [
      { label: "System", value: "Hybrid Phase/Contrast AF" },
      { label: "Coverage", value: "90% × 90% frame" },
      { label: "AF Points", value: "273 points" },
      { label: "Subject Detection", value: "Human · Animal · Vehicle" },
    ],
  },
  {
    category: "Video",
    items: [
      { label: "Max Resolution", value: "8K UHD @ 30fps" },
      { label: "4K", value: "4K @ 120fps" },
      { label: "Formats", value: "N-RAW, ProRes RAW HQ" },
      { label: "Log Profile", value: "N-Log, HLG" },
    ],
  },
  {
    category: "Body",
    items: [
      { label: "Stabilization", value: "8-stop IBIS" },
      { label: "Shutter", value: "1/8000s – 900s" },
      { label: "Sealing", value: "Dust & Moisture resistant" },
      { label: "Weight", value: "710g (body only)" },
    ],
  },
];

function SpecGroup({
  category,
  items,
  index,
}: {
  category: string;
  items: { label: string; value: string }[];
  index: number;
}) {
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: "translateY(20px)",
        transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
      }}
    >
      <h3 className="text-[#c8a84e] text-[10px] tracking-[0.3em] uppercase font-mono mb-5">
        {category}
      </h3>
      <div className="space-y-0">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`flex justify-between items-baseline py-3.5 ${
              i < items.length - 1 ? "border-b border-white/5" : ""
            }`}
          >
            <span className="text-white/35 text-xs tracking-wide">
              {item.label}
            </span>
            <span className="text-white/80 text-sm font-medium text-right ml-4">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SpecsSection() {
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
    <section id="specs" className="relative py-32 px-6 md:px-12">
      {/* Subtle top separator */}
      <div className="absolute top-0 left-6 right-6 md:left-12 md:right-12 h-px bg-white/5" />

      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div
          ref={headingRef}
          className="mb-20"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p className="text-[#c8a84e] text-xs tracking-[0.3em] uppercase font-mono mb-4">
            Specifications
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white max-w-lg leading-tight">
            Numbers that{" "}
            <span className="text-white/30">speak for themselves.</span>
          </h2>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {specs.map((group, i) => (
            <SpecGroup
              key={group.category}
              category={group.category}
              items={group.items}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
