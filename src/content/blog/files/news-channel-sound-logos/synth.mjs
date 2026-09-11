/**
 * Synthesize short mono WAV previews from letter-note melodies
 * (A-centered relative pitch, matching news-channel-sound-logos.md).
 *
 * Usage: node src/content/blog/files/news-channel-sound-logos/synth.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = __dirname;

const SAMPLE_RATE = 44100;
const NOTE_MS = 320;
const GAP_MS = 40;
const ATTACK_MS = 12;
const RELEASE_MS = 80;

/** Semitones from reference A for bare letter names in one octave band A~G
 *  (ascending: A B C D E F G). Lower band A-~G-; upper band A+~G+.
 */
const SEMITONE_FROM_A = {
	A: 0,
	B: 2,
	C: 3,
	D: 5,
	E: 7,
	F: 8,
	G: 10,
};

/**
 * @param {string} token e.g. A, D-, G+, A++
 * @returns {number} semitones from A4
 */
function parseNote(token) {
	const match = /^([A-G])([+-]*)$/iu.exec(token.trim());
	if (!match) {
		throw new Error(`Bad note token: ${JSON.stringify(token)}`);
	}

	const letter = match[1].toUpperCase();
	let octaveShift = 0;
	for (const mark of match[2]) {
		octaveShift += mark === '+' ? 1 : -1;
	}

	return SEMITONE_FROM_A[letter] + octaveShift * 12;
}

/**
 * @param {string} melody
 * @returns {number[]}
 */
function parseMelody(melody) {
	return melody
		.replace(/\.\.\./gu, '')
		.trim()
		.split(/\s+/u)
		.filter(Boolean)
		.map(parseNote);
}

/**
 * Soft triangle-ish tone with simple envelope.
 * @param {number} freq
 * @param {number} durationSec
 * @returns {Float32Array}
 */
function renderNote(freq, durationSec) {
	const n = Math.max(1, Math.floor(SAMPLE_RATE * durationSec));
	const samples = new Float32Array(n);
	const attack = Math.min(n, Math.floor((ATTACK_MS / 1000) * SAMPLE_RATE));
	const release = Math.min(n, Math.floor((RELEASE_MS / 1000) * SAMPLE_RATE));

	for (let i = 0; i < n; i += 1) {
		const t = i / SAMPLE_RATE;
		const phase = 2 * Math.PI * freq * t;
		// Soft triangle + quiet sine fundamental
		const tri = (2 / Math.PI) * Math.asin(Math.sin(phase));
		const sine = Math.sin(phase);
		let amp = 0.28 * tri + 0.12 * sine;

		if (i < attack) {
			amp *= i / attack;
		} else if (i > n - release) {
			amp *= (n - i) / release;
		}

		samples[i] = amp;
	}

	return samples;
}

/**
 * @param {number[]} semitoneOffsets
 * @returns {Float32Array}
 */
function renderMelody(semitoneOffsets) {
	const noteSamples = Math.floor((NOTE_MS / 1000) * SAMPLE_RATE);
	const gapSamples = Math.floor((GAP_MS / 1000) * SAMPLE_RATE);
	const chunks = [];

	for (const [index, semitones] of semitoneOffsets.entries()) {
		const freq = 440 * 2 ** (semitones / 12);
		chunks.push(renderNote(freq, NOTE_MS / 1000));
		if (index < semitoneOffsets.length - 1) {
			chunks.push(new Float32Array(gapSamples));
		}
	}

	// Trailing silence so players don't cut release
	chunks.push(new Float32Array(Math.floor(0.15 * SAMPLE_RATE)));

	let total = 0;
	for (const chunk of chunks) {
		total += chunk.length;
	}

	const out = new Float32Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.length;
	}

	return out;
}

/**
 * @param {Float32Array} samples
 * @returns {Buffer}
 */
function encodeWav(samples) {
	const dataSize = samples.length * 2;
	const buffer = Buffer.alloc(44 + dataSize);
	buffer.write('RIFF', 0);
	buffer.writeUInt32LE(36 + dataSize, 4);
	buffer.write('WAVE', 8);
	buffer.write('fmt ', 12);
	buffer.writeUInt32LE(16, 16);
	buffer.writeUInt16LE(1, 20); // PCM
	buffer.writeUInt16LE(1, 22); // mono
	buffer.writeUInt32LE(SAMPLE_RATE, 24);
	buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
	buffer.writeUInt16LE(2, 32);
	buffer.writeUInt16LE(16, 34);
	buffer.write('data', 36);
	buffer.writeUInt32LE(dataSize, 40);

	let o = 44;
	for (let i = 0; i < samples.length; i += 1) {
		const clamped = Math.max(-1, Math.min(1, samples[i]));
		buffer.writeInt16LE(Math.round(clamped * 32767), o);
		o += 2;
	}

	return buffer;
}

const entries = [
	{ id: 'cctv-2', melody: 'C D G' },
	{ id: 'cgtn', melody: 'A E C D A+ A+' },
	{ id: 'rossiya-24', melody: 'A D E D E A+' },
	{ id: 'kan', melody: 'E D C D E A' },
	{ id: 'zdf', melody: 'A D- A D C G- G- C G- A' },
	{ id: 'rtve', melody: 'A E C D A+' },
];

await mkdir(outDir, { recursive: true });

for (const entry of entries) {
	const semitones = parseMelody(entry.melody);
	const wav = encodeWav(renderMelody(semitones));
	const filePath = path.join(outDir, `${entry.id}.wav`);
	await writeFile(filePath, wav);
	console.log(`wrote ${path.relative(process.cwd(), filePath)} (${semitones.length} notes)`);
}
