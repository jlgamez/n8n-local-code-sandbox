import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { setup } from './lib/n8n-globals.js';

const folderArg = process.argv[2];
if (!folderArg) {
  console.error('Usage: npm run node -- <node-name>');
  process.exit(1);
}

// Accept either a bare node name ("merge-top-slots") or a full path ("code-nodes/merge-top-slots")
const folderPath = folderArg.includes('/') ? resolve(folderArg) : resolve('code-nodes', folderArg);
const inputPath = resolve(folderPath, 'input.json');
const scriptPath = resolve(folderPath, 'script.js');

const inputData = JSON.parse(await readFile(inputPath, 'utf-8'));
setup(inputData);

await import(scriptPath);
