import { useMemo, useState } from 'react';
import MenuItemCard from './MenuItemCard.jsx';

const filters = ['All', 'Starters', 'Main Courses', 'Desserts'];

function SectionTitle({ eyebrow, title, intro, id }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title" id={id}>{title}</h2>
      {intro && <p className="text-sm text-stone-600">{intro}</p>}
    </div>
  );
}

function AboutSection() {
  return (
    <section className="section-pad bg-[#eeece3]" id="about" aria-labelledby="about-title">
      <div className="site-container grid items-center gap-10 md:grid-cols-2 lg:gap-20">
        <div className="relative mr-2">
          <img
            className="relative aspect-[1.34/1] w-full object-cover"
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=90"
            alt="Candlelit table set for dinner in an inviting Italian restaurant"
            loading="lazy"
          />
          <span className="image-caption">Gather around our table</span>
        </div>
        <div className="max-w-xl">
          <p className="eyebrow">Our story</p>
          <h2 className="section-title mb-5 text-left" id="about-title">About Us</h2>
          <p className="mb-4 font-serif text-xl leading-relaxed text-stone-800">
            A family table, a generous pour, and recipes worth sharing.
          </p>
          <p className="mb-3 text-sm leading-7 text-stone-600">
            Bella Tavola is a family-owned restaurant serving traditional Italian food made with fresh, local ingredients. We bring the warmth of our family kitchen to every plate, with simple seasonal flavors and a little Italian hospitality.
          </p>
          <p className="mb-4 text-sm leading-7 text-stone-600">
            Come as you are, stay a little longer, and let us make you feel at home.
          </p>
          <a className="text-link" href="#reservation">Come join us <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}

function ReservationSection() {
  return (
    <section className="section-pad" id="reservation" aria-labelledby="reservation-title">
      <div className="site-container max-w-4xl">
        <SectionTitle
          eyebrow="Your table is waiting"
          title="Make a Reservation"
          intro="We look forward to welcoming you."
          id="reservation-title"
        />
        <div className="rounded-md border border-stone-200 bg-white/75 p-6 text-center shadow-sm sm:p-8">
          <p className="mb-5 text-sm leading-7 text-stone-600">
            Call us to reserve your table and let us know when you’re coming.
          </p>
          <a className="primary-button" href="tel:+35568000000">Call +355 68 000 000</a>
        </div>
      </div>
    </section>
  );
}

export default function MainContent({ items, loading, error, onRetry }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});

  const visibleGroups = useMemo(() => {
    const categories = selectedCategory === 'All' ? filters.slice(1) : [selectedCategory];
    return categories
      .map((category) => ({
        category,
        items: items.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [items, selectedCategory]);

  return (
    <main>
      <section className="section-pad" id="menu" aria-labelledby="menu-title">
        <div className="site-container">
          <SectionTitle
            eyebrow="Made with amore"
            title="Our Menu"
            intro="A few of our favorite things, prepared fresh every day."
            id="menu-title"
          />
          <div className="mb-7 flex flex-wrap justify-center gap-2" aria-label="Filter menu by category">
            {filters.map((filter) => (
              <button
                className={`filter-button ${selectedCategory === filter ? 'filter-button-active' : ''}`}
                key={filter}
                type="button"
                aria-pressed={selectedCategory === filter}
                onClick={() => setSelectedCategory(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          {loading && <p className="py-10 text-center text-sm text-stone-600" role="status">Loading our menu…</p>}
          {!loading && error && (
            <div className="py-10 text-center" role="alert">
              <p className="mb-4 text-sm text-red-800">{error}</p>
              <button className="primary-button" onClick={onRetry} type="button">Try again</button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="py-10 text-center text-sm text-stone-600">
              Our menu is being prepared. Please check back soon.
            </p>
          )}
          {!loading && !error && visibleGroups.length > 0 && (
            <div className="grid min-w-0 grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {visibleGroups.map((group) => (
                <section className="min-w-0" key={group.category} aria-label={group.category}>
                  <h3 className="category-heading">{group.category}</h3>
                  <div className="grid min-w-0 gap-3">
                    {group.items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={quantities[item.id] ?? 0}
                        onQuantityChange={(value) => setQuantities((current) => ({
                          ...current,
                          [item.id]: value,
                        }))}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
      <AboutSection />
      <ReservationSection />
    </main>
  );
}
