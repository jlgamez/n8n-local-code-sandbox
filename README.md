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

Inside `script.js` you have access to `$input`, just like in n8n:

```js
const items = $input.all();

const result = items.map(item => ({
  json: {
    ...item.json ?? item,
    // your transformation here
  },
}));

console.log(JSON.stringify(result, null, 2));
```

Available methods:

| Method | Description |
|---|---|
| `$input.all()` | Returns all input items as an array |
| `$input.first()` | Returns the first item |
| `$input.item` | The first item (shorthand property) |

## Adding a new node

Ask Claude: *"create a new code node for X"* or run `/n8n-coder` — it will scaffold both files and verify the output.
