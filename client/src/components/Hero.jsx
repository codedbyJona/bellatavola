export default function Hero() {
  return (
    <section className="hero flex min-h-[500px] items-center text-white sm:min-h-[560px] lg:min-h-[650px]" id="home">
      <div className="site-container w-full">
        <p className="eyebrow text-amber-100">A little taste of Italy</p>
        <h1 className="font-serif text-6xl font-medium tracking-tight sm:text-7xl lg:text-8xl">
          Bella Tavola
        </h1>
        <p className="mb-7 text-base tracking-widest text-white/90 sm:text-xl">
          Authentic Italian Cuisine
        </p>
        <a className="primary-button" href="#reservation">
          Reserve a Table <span aria-hidden="true">→</span>
        </a>
      </div>
      <a className="scroll-cue" href="#menu" aria-label="Scroll to our menu"><span /></a>
    </section>
  );
}
