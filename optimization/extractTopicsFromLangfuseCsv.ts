#!/usr/bin/env bun
import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "fs";

const inputPath = "langfuse-traces.csv";
const outputPath = process.argv[3] || "topics_list.txt";

// --- Read and parse CSV ---
const csvText = readFileSync(inputPath, "utf8");
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
});

// --- Extract topics ---
const topicRegex = /Topic:\s*(.*)/;
const seen = new Set<string>();
const topics: string[] = [];

for (const row of records) {
  const cell = String(row.input || ""); // use 'input' column
  const lines = cell.split(/\r?\n/);
  for (const line of lines) {
    const m = topicRegex.exec(line);
    if (m) {
      const t = m[1]
        .trim()
        .replace(/^["“”']+|["“”']+$/g, "")
        .trim();
      if (t && t.length < 300 && !seen.has(t)) {
        seen.add(t);
        topics.push(t);
      }
    }
  }
}

// --- Write output ---
writeFileSync(outputPath, topics.join("\n"), "utf8");
console.log(`✅ Extracted ${topics.length} topics to ${outputPath}`);
