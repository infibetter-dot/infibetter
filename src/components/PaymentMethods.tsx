const paymentMethods = [
  {
    name: "Visa",
    src: "https://cdn.simpleicons.org/visa/1434CB",
  },
  {
    name: "Mastercard",
    src: "https://cdn.simpleicons.org/mastercard",
  },
  {
    name: "American Express",
    src: "https://cdn.simpleicons.org/americanexpress",
  },
  {
    name: "PayPal",
    src: "https://cdn.simpleicons.org/paypal",
  },
  {
    name: "Diners Club",
    src: "https://cdn.simpleicons.org/dinersclub",
  },
  {
    name: "Discover",
    src: "https://cdn.simpleicons.org/discover",
  },
];

export function PaymentMethods() {
  return (
    <div className="mt-4 border-y border-neutral-200 py-4">
      <div
        className="flex items-center justify-center gap-4 sm:gap-5"
        aria-label="Accepted payment methods"
      >
        {paymentMethods.map((payment) => (
          <div
            key={payment.name}
            className="flex h-7 w-10 items-center justify-center"
            title={payment.name}
          >
            <img
              src={payment.src}
              alt={payment.name}
              className="max-h-6 max-w-10 object-contain"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
