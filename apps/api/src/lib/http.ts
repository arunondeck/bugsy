export const getOriginHost = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (error) {
    return null;
  }
};

export const maskKey = (key: string): string => {
  if (key.length <= 4) {
    return '****';
  }
  return `${key.slice(0, 2)}****${key.slice(-2)}`;
};

export interface CsvField {
  title: string;
  body?: string | null;
  status: string;
  authorEmail?: string | null;
  createdAt: Date | string;
}

export const csvFromFeedback = (items: CsvField[]): string => {
  const header = ['Title', 'Body', 'Status', 'Author Email', 'Created At'];
  const rows = items.map((item) => [
    escapeCsv(item.title),
    escapeCsv(item.body ?? ''),
    escapeCsv(item.status),
    escapeCsv(item.authorEmail ?? ''),
    escapeCsv(new Date(item.createdAt).toISOString())
  ]);
  return [header, ...rows].map((line) => line.join(',')).join('\n');
};

const escapeCsv = (value: string): string => {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};
