import QuantityStepper from './QuantityStepper.jsx';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function MenuItemCard({ item, quantity, onQuantityChange }) {
  return (
    <article className="flex min-w-0 overflow-hidden rounded border border-stone-200 bg-white/75 transition hover:-translate-y-1 hover:border-emerald-900/30 hover:shadow-lg">
      <img
        className="h-auto min-h-28 w-24 shrink-0 self-stretch object-cover sm:w-28"
        src={item.imageUrl}
        alt={item.imageAlt}
        loading="lazy"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-3 sm:p-4">
        <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <h4 className="font-bold text-stone-800">{item.name}</h4>
          <span className="shrink-0 font-bold text-emerald-900">
            {priceFormatter.format(item.priceCents / 100)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-stone-600">{item.description}</p>
        <QuantityStepper
          itemName={item.name}
          value={quantity}
          onChange={onQuantityChange}
        />
      </div>
    </article>
  );
}
