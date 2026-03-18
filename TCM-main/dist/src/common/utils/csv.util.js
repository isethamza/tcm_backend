"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCSV = toCSV;
function toCSV(rows, headers) {
    const headerLine = headers.map(h => `"${h.label}"`).join(',');
    const dataLines = rows.map(row => headers
        .map(h => `"${row[h.key] ?? ''}"`)
        .join(','));
    return [headerLine, ...dataLines].join('\n');
}
//# sourceMappingURL=csv.util.js.map