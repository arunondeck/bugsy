import { promises as fs } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, '../src/styles.css');
const distPath = resolve(__dirname, '../dist/styles.css');

async function main() {
  try {
    const css = await fs.readFile(srcPath, 'utf8');
    await fs.mkdir(dirname(distPath), { recursive: true });
    await fs.writeFile(distPath, css, 'utf8');
  } catch (error) {
    if (error && /** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT') {
      return;
    }
    console.error('[build-css] failed to copy styles.css');
    console.error(error);
    process.exitCode = 1;
  }
}

main();
