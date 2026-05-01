# n8n Local Code Sandbox

A local environment for developing and testing n8n Code node scripts without running n8n.

## How it works

- `runner.js` wires up the n8n globals (`$input`) and executes the target `script.js`.
- `lib/n8n-globals.js` simulates the n8n Code node globals (`$input`, `$json`, and stubs). Use the `/n8n-runtime` skill for available globals and known gaps.

## Running a code node

```bash
npm run node -- <node-name>
```

## Folder structure

Each folder under `code-nodes/` represents one n8n Code node:

```
code-nodes/
  <node-name>/
    input.json   # array of input items
    script.js    # node logic using $input
```

## Coding, debugging, and fixing code nodes

When implementing, reviewing, or fixing any `script.js` file, apply the `/n8n-coder` skill guidelines automatically — even if not explicitly invoked.

## Scaffolding a new code node

When the user asks to create, add, or scaffold a node, the `/n8n-coder` skill handles scaffolding, conventions, and verification.
