// Minimal CSV parser for Mutation.importInstagramAutomationRulesFromCsv.
// Deliberately hand-rolled instead of pulling in a CSV library — the
// expected input is small and simple (a header row plus "keywords,
// replyMessage" rows), and a full RFC 4180 parser is more than this needs.
// Still handles the common real-world cases: quoted fields (so a
// replyMessage can contain commas), escaped quotes ("") inside a quoted
// field, and \r\n or \n line endings.
export type ParsedInstagramAutomationRuleCsvRow = {
  keywords: string[];
  replyMessage: string;
};

const REQUIRED_HEADERS = ['keywords', 'replymessage'];

export const parseInstagramAutomationRulesCsv = (
  csvContent: string,
): ParsedInstagramAutomationRuleCsvRow[] => {
  const lines = csvContent
    .split(/\r\n|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headerCells = parseCsvLine(lines[0]).map((cell) =>
    cell.trim().toLowerCase(),
  );

  const keywordsColumnIndex = headerCells.indexOf('keywords');
  const replyMessageColumnIndex = headerCells.indexOf('replymessage');

  const hasExpectedHeader = REQUIRED_HEADERS.every((header) =>
    headerCells.includes(header),
  );

  // No recognizable header — treat every line (including the first) as data,
  // assuming the column order is exactly "keywords,replyMessage".
  const dataLines = hasExpectedHeader ? lines.slice(1) : lines;
  const [keywordsIndex, replyIndex] = hasExpectedHeader
    ? [keywordsColumnIndex, replyMessageColumnIndex]
    : [0, 1];

  return dataLines
    .map((line) => parseCsvLine(line))
    .filter((cells) => cells.length > Math.max(keywordsIndex, replyIndex))
    .map((cells) => ({
      keywords: cells[keywordsIndex]
        .split(/[|;]/)
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0),
      replyMessage: cells[replyIndex].trim(),
    }))
    .filter((row) => row.keywords.length > 0 && row.replyMessage.length > 0);
};

const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let currentCell = '';
  let isInsideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (isInsideQuotes) {
      if (character === '"') {
        if (line[index + 1] === '"') {
          currentCell += '"';
          index += 1;
        } else {
          isInsideQuotes = false;
        }
      } else {
        currentCell += character;
      }

      continue;
    }

    if (character === '"') {
      isInsideQuotes = true;
      continue;
    }

    if (character === ',') {
      cells.push(currentCell);
      currentCell = '';
      continue;
    }

    currentCell += character;
  }

  cells.push(currentCell);

  return cells;
};
