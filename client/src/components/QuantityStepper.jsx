export default function QuantityStepper({ value, onChange, itemName }) {
  return (
    <div className="quantity-stepper" aria-label={`${itemName} quantity`}>
      <button
        type="button"
        aria-label={`Remove one ${itemName}`}
        disabled={value === 0}
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        −
      </button>
      <output aria-live="polite" aria-label={`${value} ${itemName} selected`}>{value}</output>
      <button
        type="button"
        aria-label={`Add one ${itemName}`}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
