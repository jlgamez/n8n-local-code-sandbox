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

## When to use the `/new-code-node` skill

Invoke `/new-code-node` whenever the user asks to:
- create a new code node
- add a new node
- scaffold a node
- test a transformation

The skill handles scaffolding, conventions, and verification.
