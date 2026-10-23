export default function Footer() {
  return (
    <footer className="bg-emerald-950 py-12 text-white/80">
      <div className="site-container grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_.8fr]">
        <div>
          <a className="brand footer-brand" href="#home">
            <span className="brand-mark" aria-hidden="true">B</span>
            <span>Bella <span className="font-medium">Tavola</span></span>
          </a>
          <p className="mt-3 font-serif italic">Good food.<br />Good company.</p>
        </div>
        <div>
          <h2 className="footer-heading">Opening Hours</h2>
          <p className="footer-line"><span>Monday – Friday</span><span>12:00 – 22:00</span></p>
          <p className="footer-line"><span>Saturday</span><span>12:00 – 23:00</span></p>
          <p className="footer-line"><span>Sunday</span><span>Closed</span></p>
        </div>
        <div>
          <h2 className="footer-heading">Find Us</h2>
          <p className="mb-2 text-xs leading-6">Via Tr 25<br />00100 Tirana, Albania</p>
          <a className="text-xs hover:text-white hover:underline" href="tel:+35568000000">+355 68 000 000</a>
        </div>
        <div className="flex justify-between gap-3 border-t border-white/20 pt-4 text-[10px] text-white/60 sm:col-span-2 lg:col-span-3">
          <span>© 2026 Bella Tavola</span>
          <span>Made with <span className="text-amber-200" aria-label="love">♥</span> in Albania</span>
        </div>
      </div>
    </footer>
  );
}
