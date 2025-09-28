import type { OpeningLine } from "./database.types";
import { OPENING_LINES } from "./database";

export interface OpeningMatch {
  opening: OpeningLine;
  matchedLength: number;
  isComplete: boolean;
}

export interface OpeningAnnotation {
  match: OpeningMatch | null;
}

const normalizeSan = (san: string): string => {
  return san
    .replace(/[+#?!]/g, "")
    .replace(/=/g, "=")
    .trim();
};

interface NormalizedOpening extends OpeningLine {
  normalizedMoves: string[];
}

const NORMALIZED_OPENINGS: NormalizedOpening[] = OPENING_LINES.map((opening) => ({
  ...opening,
  normalizedMoves: opening.moves.map(normalizeSan),
}));

export const findOpeningMatch = (moves: string[]): OpeningMatch | null => {
  if (moves.length === 0) {
    return null;
  }

  const normalizedMoves = moves.map(normalizeSan);
  let bestMatch: OpeningMatch | null = null;

  for (const opening of NORMALIZED_OPENINGS) {
    if (opening.normalizedMoves.length < normalizedMoves.length) {
      continue;
    }

    let matchedLength = 0;
    while (
      matchedLength < normalizedMoves.length &&
      normalizedMoves[matchedLength] === opening.normalizedMoves[matchedLength]
    ) {
      matchedLength += 1;
    }

    if (matchedLength === normalizedMoves.length) {
      if (
        !bestMatch ||
        matchedLength > bestMatch.matchedLength ||
        (matchedLength === bestMatch.matchedLength &&
          opening.normalizedMoves.length <
            bestMatch.opening.moves.length)
      ) {
        bestMatch = {
          opening,
          matchedLength,
          isComplete: matchedLength === opening.normalizedMoves.length,
        };
      }
    }
  }

  return bestMatch;
};

export const getOpeningAnnotations = (moves: string[]): OpeningAnnotation[] => {
  const annotations: OpeningAnnotation[] = [];

  for (let i = 0; i < moves.length; i += 1) {
    const segment = moves.slice(0, i + 1);
    const match = findOpeningMatch(segment);
    annotations.push({ match });
  }

  return annotations;
};
