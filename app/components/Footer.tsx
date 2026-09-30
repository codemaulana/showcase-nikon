export default function Footer() {
  const whatsappUrl =
    "https://wa.me/6283137446693?text=Halo%20Maulana,%20saya%20tertarik%20untuk%20membuat%20website%20seperti%20showcase%20kamera%20ini.";

  return (
    <footer className="relative border-t border-white/10 pt-16 pb-12 px-6 md:px-12 bg-gradient-to-b from-[#0a0a0a] to-[#050505] overflow-hidden">
      {/* Background glow accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[120px] pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(200, 168, 78, 0.4) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Banner: Web Development CTA */}
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-sm shadow-2xl">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8a84e]/10 border border-[#c8a84e]/20 text-[#c8a84e] text-[10px] font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8a84e] animate-pulse" />
              <span>Available for Bespoke Projects</span>
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-white tracking-tight">
              Tertarik membuat website interaktif &amp; premium seperti ini?
            </h3>
            <p className="text-white/50 text-xs md:text-sm leading-relaxed">
              Hubungi saya untuk pembuatan website portofolio 3D, showcase produk, landing page modern, maupun web app berkinerja tinggi.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#c8a84e] hover:bg-[#e8c97a] text-black text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(200,168,78,0.25)] hover:shadow-[0_0_28px_rgba(200,168,78,0.4)] hover:scale-[1.02] cursor-pointer shrink-0"
          >
            {/* WhatsApp Icon */}
            <svg
              className="w-4 h-4 text-black transition-transform group-hover:rotate-12"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.158.57 4.183 1.564 5.934l-1.564 5.722 5.888-1.545c1.706.945 3.67 1.489 5.759 1.489 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>Hubungi Saya (WhatsApp)</span>
            <span className="text-black/60 text-[10px] hidden sm:inline">0831-3744-6693</span>
          </a>
        </div>

        {/* Bottom Credits & Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
          {/* Left: Maulana Signature Credit */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <p className="text-white/40 text-xs font-mono tracking-widest uppercase">
              © 2026 Maulana
            </p>
            <span className="hidden sm:block text-white/10">·</span>
            <p className="text-white/30 text-xs font-mono">
              Crafted with care &amp; precision. All rights reserved.
            </p>
          </div>

          {/* Right: Quick Links & Back to top */}
          <div className="flex items-center gap-6">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c8a84e] hover:text-[#e8c97a] text-xs font-mono tracking-widest uppercase transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8a84e]" />
              <span>WhatsApp: 083137446693</span>
            </a>
            <span className="text-white/10">·</span>
            <a
              href="#hero"
              className="text-white/30 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
