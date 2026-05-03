# n8n-local-code-sandbox

Run and test n8n Code node scripts locally without spinning up n8n.

## How it works

Each folder under `code-nodes/` represents one n8n Code node. The runner wires up the `$input` global (simulating the n8n runtime) and executes the node's `script.js` against its `input.json`.

## Structure

```
code-nodes/
  <node-name>/
    input.json   # array of input items
    script.js    # node logic using $input
lib/
  n8n-globals.js # simulates $input
runner.js        # CLI entry point
```

## Running a node

```bash
npm run node -- <node-name>
```

## Writing a node script

Scripts work exactly like n8n Code nodes with **one exception**: instead of `return result`, use `console.log` to output the result. The runner executes scripts as ES modules where top-level `return` is a syntax error; in n8n the script runs inside a function so `return` works there.

```js
// In n8n you'd write:  return result;
// In this sandbox:
console.log(JSON.stringify(result, null, 2));
```

Everything else is identical — `$input`, `$json`, `$('NodeName')`, and all other globals behave the same way.

### Example

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

### Available globals

| Global | Description |
|---|---|
| `$input.all()` | All input items as `{ json, binary }[]` |
| `$input.first()` | First item |
| `$input.last()` | Last item |
| `$input.item` | First item (shorthand) |
| `$json` | `$input.first().json` |
| `$('NodeName')` | Another node's output — requires `other_node_<NodeName>.json` in the folder |

## Adding a new node with via AI assisted coding

Ask Claude/Codex/other: *"create a new code node for X"* or run `/n8n-coder` — it will scaffold both files and verify the output.
