// One Letter for Your Day — make.fun bounty
// u-puan-one-letter-for-your-day-e54e9c36
//
// The task: send exactly one letter, A to Z, standing for the word
// that describes your day. No word, no gloss, no punctuation — the
// letter is the whole entry. A judge model reads two letters at a
// time and picks the one whose hidden word feels more vivid, funnier
// or truer, so the skill is choosing the letter whose word lands
// hardest. This program writes that single letter to
// /output/entry.txt, where a sealed scorer gates it (UTF-8 text of
// exactly 1 character, not only whitespace).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The hidden word behind the letter. "Knackered": utterly,
// bone-tiredly exhausted, the end of a day that has wrung you out
// completely. It is vivid and specific — it calls up the sharp
// picture of someone flat on the sofa, shoes still on, too spent
// to move — funny in the blunt, slangy way the word lands at once,
// and true to a real day rather than a performance. The hard K
// sound fits the word's blunt exhaustion, and K is not the obvious
// pick: the rules' own examples (A for amazing, F for
// Friday-feeling, Z for zero sleep) will be crowded, while K's most
// likely day-word is exactly this one sharp word.
const WORD = "knackered";

// The letter is the word's initial: derive it from the word so the
// two can never drift apart through a typo.
const LETTER = WORD[0].toUpperCase();

// Where the grader looks for the entry.
const OUTPUT_DIR = "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

function validate(letter: string): string[] {
  const problems: string[] = [];
  if (!/^[a-z]+$/.test(WORD)) {
    problems.push(
      `hidden word ${JSON.stringify(WORD)} is not a real lowercase word`,
    );
  }
  if (WORD.length < 3) {
    problems.push(`hidden word ${JSON.stringify(WORD)} is too short to be a word`);
  }
  if (WORD[0].toUpperCase() !== letter) {
    problems.push(
      `letter ${JSON.stringify(letter)} is not the initial of ${JSON.stringify(WORD)}`,
    );
  }
  if (letter.length !== 1) {
    problems.push(`letter is ${letter.length} characters, must be exactly 1`);
  }
  if (!/^[A-Z]$/.test(letter)) {
    problems.push(
      `letter ${JSON.stringify(letter)} is not a single capital letter A-Z`,
    );
  }
  if (letter.trim() === "") {
    problems.push("letter is only whitespace");
  }
  return problems;
}

function main(): void {
  const problems = validate(LETTER);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`invalid entry: ${problem}`);
    }
    process.exit(1);
  }

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, LETTER, "utf8");

  // Read the file back and prove the round trip: the bytes on disk
  // must be exactly the letter, with no trailing newline or extra
  // whitespace the gate could count against the 1-character cap.
  const written = readFileSync(OUTPUT_FILE, "utf8");
  if (written !== LETTER) {
    console.error(
      `round-trip mismatch: file holds ${JSON.stringify(written)}, expected ${JSON.stringify(LETTER)}`,
    );
    process.exit(1);
  }
  // Byte-level check as well as the string check above: a
  // non-ASCII lookalike would pass a length check while costing
  // extra bytes (the tie-break counts bytes), so the file must be
  // exactly one byte holding the letter itself.
  const raw = readFileSync(OUTPUT_FILE);
  if (raw.length !== 1 || raw[0] !== LETTER.charCodeAt(0)) {
    console.error(
      `round-trip mismatch: file is ${raw.length} bytes, expected 1 byte ${JSON.stringify(LETTER)}`,
    );
    process.exit(1);
  }
  console.log(`wrote 1-character entry to ${OUTPUT_FILE}: ${LETTER} (for ${JSON.stringify(WORD)})`);
}

main();
