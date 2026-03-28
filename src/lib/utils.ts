export function formatCurrency(amount: number): string {
  return '$' + amount.toFixed(2);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
