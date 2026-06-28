import { readFile, readdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setup } from './lib/n8n-globals.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const folderArg = process.argv[2];
if (!folderArg) {
  console.error('Usage: npm run node -- <node-name>');
  process.exit(1);
}

const folderPath = folderArg.includes('/') ? resolve(folderArg) : resolve(__dirname, 'code-nodes', folderArg);
const inputPath = resolve(folderPath, 'input.json');
const scriptPath = resolve(folderPath, 'script.js');

const inputData = JSON.parse(await readFile(inputPath, 'utf-8'));

const files = await readdir(folderPath);
const otherNodes = {};
for (const file of files.filter(f => f.startsWith('other_node_') && f.endsWith('.json'))) {
  const nodeName = file.slice('other_node_'.length, -'.json'.length);
  otherNodes[nodeName] = JSON.parse(await readFile(resolve(folderPath, file), 'utf-8'));
}

setup(inputData, otherNodes);

await import(scriptPath);
