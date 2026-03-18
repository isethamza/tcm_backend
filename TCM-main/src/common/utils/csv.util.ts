export function toCSV(
  rows: Record<string, any>[],
  headers: { key: string; label: string }[]
): string {
  const headerLine = headers.map(h => `"${h.label}"`).join(',');

  const dataLines = rows.map(row =>
    headers
      .map(h => `"${row[h.key] ?? ''}"`)
      .join(',')
  );

  return [headerLine, ...dataLines].join('\n');
}
