export function formatLkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
}

export function discountPercent(price: number, originalPrice: number): number {
  if (originalPrice <= price) {
    return 0;
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
