"use client";

import { useEffect, useState } from "react";

interface NavbarProps {
  onOpenConfigurator?: () => void;
}

export default function Navbar({ onOpenConfigurator }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Section spy
      const sections = ["hero", "monochrome", "craftsmanship", "features", "specs"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Overview", id: "hero" },
    { label: "B&W", id: "monochrome" },
    { label: "Craft", id: "craftsmanship" },
    { label: "Features", id: "features" },
    { label: "Specs", id: "specs" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => scrollToSection("hero")}
          className="flex items-center gap-2.5 group cursor-pointer text-left"
          aria-label="Nikon Zf Showcase"
        >
          <div className="w-7 h-7 rounded-sm bg-[#c8a84e] flex items-center justify-center shadow-[0_0_12px_rgba(200,168,78,0.3)] transition-transform group-hover:scale-105">
            <svg
              className="w-4 h-4 text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-[0.2em] text-white uppercase group-hover:text-[#c8a84e] transition-colors">
              Nikon Zf
            </span>
            <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase -mt-0.5">
              Showcase
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/10 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-black font-semibold bg-[#c8a84e] shadow-[0_0_12px_rgba(200,168,78,0.4)]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop Action Button: Configurator / Build Your Zf */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenConfigurator ? onOpenConfigurator : () => scrollToSection("features")}
            className="text-xs font-mono tracking-[0.2em] uppercase px-4 py-2 border border-[#c8a84e]/60 text-[#c8a84e] hover:bg-[#c8a84e] hover:text-black transition-all duration-200 rounded-full cursor-pointer shadow-[0_0_15px_rgba(200,168,78,0.15)]"
          >
            Build Your Zf
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="md:hidden p-2 text-white/70 hover:text-white rounded-lg border border-white/10 bg-white/5 cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Animated Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl px-6 py-5 flex flex-col gap-2.5 animate-fadeIn">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-left px-4 py-2 rounded-xl text-sm font-mono tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-between ${
                  isActive
                    ? "bg-[#c8a84e]/15 text-[#c8a84e] font-semibold border border-[#c8a84e]/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#c8a84e]" />}
              </button>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenConfigurator) {
                onOpenConfigurator();
              } else {
                scrollToSection("features");
              }
            }}
            className="mt-2 w-full text-center py-2.5 rounded-xl bg-[#c8a84e] text-black text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(200,168,78,0.3)] cursor-pointer"
          >
            Build &amp; Reserve Zf
          </button>
        </div>
      )}
    </header>
  );
}
