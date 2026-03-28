/**
 * Client-side CSV generation and download utility.
 */

function escapeCSV(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

interface CSVColumn<T> {
  header: string;
  accessor: (item: T) => unknown;
}

export function generateCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  const header = columns.map(c => escapeCSV(c.header)).join(',');
  const rows = data.map(item =>
    columns.map(c => escapeCSV(c.accessor(item))).join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
