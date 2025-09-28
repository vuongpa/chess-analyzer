/* eslint-disable @typescript-eslint/no-require-imports */
const https = require("https");

const fetchText = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
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

const sanitizeMoves = (pgn) =>
  pgn
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\d+\.(\.\.)?/g, " ")
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, " ")
    .replace(/\.{3}/g, " ")
    .replace(/\u2026/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((token) => token.replace(/[!?+#]/g, "").trim())
    .filter((token) => token && token !== "..." && token !== "…");

(async () => {
  const regex = /([A-E]\d\d)\t([^\t]+)\t([\s\S]*?)(?=\n[A-E]\d\d\t|$)/g;
  const files = ["a", "b", "c", "d", "e"];
  const entries = [];

  for (const file of files) {
    const url = `https://raw.githubusercontent.com/lichess-org/chess-openings/master/${file}.tsv`;
    const raw = await fetchText(url);
    let match;
    while ((match = regex.exec(raw))) {
      const [, eco, name, pgnRaw] = match;
      const moves = sanitizeMoves(pgnRaw.trim());
      entries.push({ eco, name: name.trim(), moves });
    }
  }

  console.log("total entries:", entries.length);

  const filtered = entries.filter((entry) => entry.moves.length > 0 && entry.moves.length <= 16);
  console.log("filtered entries (<=16 moves):", filtered.length);

  const counts = filtered.reduce((acc, entry) => {
    acc[entry.eco] = (acc[entry.eco] || 0) + 1;
    return acc;
  }, {});

  const topEco = Object.entries(counts)
    .map(([eco, count]) => ({ eco, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  console.log("top ECO codes by entry count:", topEco);
})();
