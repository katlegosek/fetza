export function formatMoneyFromCents(cents: number, currency = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
