---
name: n8n-runtime
description: Reference for globals available in the n8n sandbox runtime — use when writing, debugging, or reviewing node scripts
---

# n8n Runtime Reference

Globals available in this sandbox when writing or debugging node scripts.

## Item shape

All items from `$input.all()` / `$input.first()` / `$input.last()` are normalized to:

```js
{ json: { /* your fields */ }, binary: {} }
```

`input.json` files can contain plain objects — the runner wraps them automatically.

## Available globals

| Global | Value |
|---|---|
| `$input.all()` | All items as `{ json, binary }[]` |
| `$input.first()` | First item |
| `$input.last()` | Last item |
| `$input.item` | First item (shorthand) |
| `$json` | `$input.first().json` |
| `$('NodeName')` | Proxy for a mocked node — `.all()`, `.first()`, `.last()`, `.item`. Requires `other_node_<NodeName>.json` in the node folder. |
| `$vars` | `{}` stub |
| `$env` | `{}` stub |
| `$workflow` | `{}` stub |
| `$execution` | `{}` stub |

## Not simulated

These n8n globals do not exist in this sandbox — code using them will need to be adapted:

- `$binary` — binary data access
- `$prevNode`, `$node` — node metadata
- `this.helpers.*` — HTTP helpers, binary helpers
