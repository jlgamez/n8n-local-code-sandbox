---
name: new-code-node
description: Scaffold a new n8n Code node folder with input.json and script.js
---

Create a new n8n Code node folder under `code-nodes/` in this sandbox.

## Steps

1. Determine the node name from the user's request. Use kebab-case describing the transformation (e.g. `filter-inactive-users`).
2. Create `code-nodes/<node-name>/input.json` — an array of input items.
3. Create `code-nodes/<node-name>/script.js` — the node logic using `$input`.
4. Run `npm run node -- code-nodes/<node-name>` to verify it works.

## If the user doesn't specify what the node should contain

Scaffold both files with a generic but runnable example:

- `input.json`: an array of 2–3 plain objects with realistic-looking fields (e.g. `id`, `name`, a domain-relevant field).
- `script.js`: a simple transformation that reads `$input.all()`, maps over the items, adds or transforms one field, and logs the result.

## Conventions

- `script.js` must end with `console.log(JSON.stringify(result, null, 2))`.
- Access input via `$input.all()`, `$input.first()`, or `$input.item`.
- Items in `input.json` can be plain objects — the runner wraps them to `{ json: {} }` automatically.

## Example scaffold

**input.json**
```json
[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" }
]
```

**script.js**
```js
const items = $input.all();

const result = items.map(item => ({
  json: {
    ...item.json,
    processed: true,
  },
}));

console.log(JSON.stringify(result, null, 2));
```
