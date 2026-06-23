import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'node_modules', '@umamichi-ui', 'giscus-theme', 'styles', 'themes');
const targetDir = path.join(root, 'public', 'giscus');

const files = await readdir(sourceDir);
const syncFiles = files.filter(
	(name) => name.endsWith('.css') || name === 'palettes.manifest.json',
);

if (syncFiles.length === 0) {
	throw new Error(`No giscus theme files found in ${sourceDir}`);
}

await mkdir(targetDir, { recursive: true });

for (const file of syncFiles) {
	await cp(path.join(sourceDir, file), path.join(targetDir, file));
}

console.log(`Synced ${syncFiles.length} giscus theme file(s) to public/giscus/`);
