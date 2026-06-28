---
name: n8n-coder
description: Guidelines and patterns for writing clean, correct n8n Code node scripts — apply automatically when implementing, debugging, or fixing script.js files. Also handles scaffolding new code node folders.
---

# n8n Code Node — Coding Guide

Apply these rules and patterns whenever writing or reviewing a `script.js` file, even without explicit invocation.

---

## The one rule that must never be broken

**Always `return` an array of n8n items.**

```js
return [{ json: { ... } }];
```

- Every element must have a `json` key.
- Never return plain objects, arrays of primitives, or nothing (that silently drops all output).
- Return `[]` only when intentionally producing no output.

---

## Execution modes

### Run Once for All Items (default)
The script runs once. Use `$input.all()` to access every item and return the full output array.

```js
const items = $input.all();
const result = items.map(item => ({ json: { ...item.json, processed: true } }));
return result;
```

### Run Once for Each Item
The script runs once per item. Use `$input.item` for the current item. Return an array with one item (or more to expand).

```js
const { name, score } = $input.item.json;
return [{ json: { name, grade: score >= 80 ? 'pass' : 'fail' } }];
```

---

## Data access patterns

| Pattern | Code |
|---|---|
| All items | `$input.all()` |
| First item's data | `$input.first().json` or `$json` |
| Current item (per-item mode) | `$input.item.json` |
| Destructure for readability | `const { id, name } = item.json` |

Use `$json` only in per-item mode or when the node is guaranteed a single item — it always refers to the first item.

---

## Core patterns

### Transform — map items, preserve existing fields

```js
const items = $input.all();

return items.map(item => ({
  json: {
    ...item.json,
    fullName: `${item.json.firstName} ${item.json.lastName}`,
  },
}));
```

### Filter then transform

```js
const items = $input.all();

return items
  .filter(item => item.json.active)
  .map(item => ({
    json: {
      id: item.json.id,
      name: item.json.name,
    },
  }));
```

### Expand — one item with a nested array → many items

```js
// item.json.orders is an array; emit one item per order
const orders = $input.first().json.orders;

return orders.map(order => ({ json: order }));
```

### Aggregate — many items → one

```js
const items = $input.all();

const total = items.reduce((sum, item) => sum + item.json.amount, 0);

return [{ json: { total, count: items.length } }];
```

---

## Clean code rules

- **Never mutate `item.json`** — always spread or construct a new object.
- **Destructure early** — `const { id, name } = item.json` over repeated `item.json.id`.
- **Guard with early return** — check for empty input at the top, not buried in logic.
- **Name the result** — assign to a named `const result` before returning, not inline.
- **No comments on obvious code** — name things well instead.

---

## Common pitfalls

| Mistake | Effect | Fix |
|---|---|---|
| Returning `{ json: ... }` (not in array) | n8n throws or drops item | Wrap in `[...]` |
| Forgetting `json:` key | n8n ignores the item | Always `{ json: { ... } }` |
| `$json` in "all items" mode | Only sees first item | Use `$input.all()` + `.map()` |
| `flatMap(item => item.json)` when `item.json` is already one item | Spreads the item's fields as separate elements | Use `.map()` instead |
| Returning `undefined` | Runner prints nothing | Ensure all paths `return` a value |

---

## Sandbox conventions

- **The only difference from real n8n**: instead of `return result`, end the script with `console.log(JSON.stringify(result, null, 2))`. The runner executes scripts as ES modules where top-level `return` is a syntax error. In n8n itself the script runs inside a function, so `return` works — but not here.
- `input.json` items are plain objects — the runner wraps them to `{ json: item }` automatically.

### Mocking other nodes

To use `$('NodeName')` in a script, add a file named `other_node_<NodeName>.json` alongside `input.json`. The name after `other_node_` must match exactly what the script passes to `$()`.

**`other_node_Fetch Users.json`**
```json
[{ "id": 1, "name": "Alice" }]
```

**`script.js`**
```js
const users = $('Fetch Users').all();
```

If the file is missing, the runner throws: `No mock data for node "Fetch Users". Add other_node_Fetch Users.json to the node folder.`

---

## Scaffolding a new code node

When asked to create, add, or scaffold a new node, follow these steps:

1. Determine the node name from the user's request — use kebab-case describing the transformation (e.g. `filter-inactive-users`).
2. Create `n8n/code-nodes/<node-name>/input.json` — an array of input items.
3. Create `n8n/code-nodes/<node-name>/script.js` — the node logic using `$input`.
4. Run `npm run node -- <node-name>` to verify it works.

If the user doesn't specify what the node should contain, scaffold both files with a generic but runnable example:

- `input.json`: an array of 2–3 plain objects with realistic-looking fields (e.g. `id`, `name`, a domain-relevant field).
- `script.js`: a simple transformation that reads `$input.all()`, maps over the items, adds or transforms one field, and returns the result.

### Example scaffold

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
