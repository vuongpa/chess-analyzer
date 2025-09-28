#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/*
 * Generate the curated openings database from the lichess-org/chess-openings dataset (CC0).
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const SOURCE_BASE = "https://raw.githubusercontent.com/lichess-org/chess-openings/master";
const SOURCE_FILES = ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"];

const fetchText = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
          return;
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk.toString("utf8");
        });
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });

const splitName = (fullName) => {
  const parts = fullName.split(":");
  if (parts.length === 1) {
    return { name: parts[0].trim(), variation: undefined };
  }

  const name = parts.shift()?.trim() ?? fullName.trim();
  const variation = parts.join(":").trim();
  return {
    name,
    variation: variation.length > 0 ? variation : undefined,
  };
};

const sanitizeMoves = (pgn) => {
  const cleaned = pgn
    .replace(/\{[^}]*\}/g, " ") // remove comments
    .replace(/\([^)]*\)/g, " ") // remove parentheses
    .replace(/\d+\.(\.\.)?/g, " ") // remove move numbers
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, " ") // remove results
    .replace(/\.{3}/g, " ") // remove ellipsis sequences
    .replace(/\u2026/g, " ") // remove unicode ellipsis
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(" ")
    .map((token) =>
      token
        .replace(/[!?+#]/g, "")
        .replace(/=\w+/g, (match) => match.toLowerCase())
        .trim()
    )
    .filter((token) => token && token !== "..." && token !== "…");
};

const shouldKeep = (entry) => {
  const moveCount = entry.moves.length;
  if (moveCount === 0) return false;

  // Exclude extremely long lines to keep matching fast.
  if (moveCount > 24) return false;

  // Ignore dubious partial data that still contains whitespace weirdness.
  if (entry.moves.some((move) => move.includes("\t") || move.includes("\n"))) {
    return false;
  }

  return true;
};

const main = async () => {
  const allEntries = [];

  for (const file of SOURCE_FILES) {
    const url = `${SOURCE_BASE}/${file}`;
    const raw = await fetchText(url);
    const regex = /([A-E]\d\d)\t([^\t]+)\t([\s\S]*?)(?=\n[A-E]\d\d\t|$)/g;
    let match;

    while ((match = regex.exec(raw))) {
      const [, eco, rawName, rawPgn] = match;
      const pgn = rawPgn.trim();
      const moves = sanitizeMoves(pgn);
      const { name, variation } = splitName(rawName.trim());

      const entry = {
        eco,
        name,
        variation,
        moves,
        // Keep original full name for debugging if needed
        fullName: rawName.trim(),
      };

      if (shouldKeep(entry)) {
        allEntries.push(entry);
      }
    }
  }

  // Deduplicate by move sequence, prefer the entry with the longest move list, then shorter eco code.
  const deduped = new Map();
  for (const entry of allEntries) {
    const key = entry.moves.join(" ");
    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, entry);
      continue;
    }

    if (entry.moves.length > existing.moves.length) {
      deduped.set(key, entry);
    } else if (
      entry.moves.length === existing.moves.length &&
      entry.eco < existing.eco
    ) {
      deduped.set(key, entry);
    }
  }

  const finalEntries = Array.from(deduped.values()).sort((a, b) => {
    if (a.eco === b.eco) {
      if (a.moves.length === b.moves.length) {
        return a.name.localeCompare(b.name);
      }
      return a.moves.length - b.moves.length;
    }
    return a.eco.localeCompare(b.eco);
  });

    const header = `// This file is auto-generated via scripts/update-openings.js using the\n// lichess-org/chess-openings dataset (CC0 1.0).\n// Do not edit manually; run "npm run generate:openings" instead.\n\nimport type { OpeningLine } from "./database.types";`;

  const lines = finalEntries.map((entry) => {
    const variationLine = entry.variation
      ? `\n    variation: ${JSON.stringify(entry.variation)},`
      : "";
    return `  {\n    eco: ${JSON.stringify(entry.eco)},\n    name: ${JSON.stringify(entry.name)},${variationLine}\n    moves: ${JSON.stringify(entry.moves)}\n  }`;
  });

  const content = `${header}\n\nexport const OPENING_LINES: OpeningLine[] = [\n${lines.join(",\n")}\n];\n`;

  const dbPath = path.resolve(__dirname, "../lib/openings/database.ts");
  fs.writeFileSync(dbPath, content);
  console.log(`Generated ${finalEntries.length} openings in ${dbPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
