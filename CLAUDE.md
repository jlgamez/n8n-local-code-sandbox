# n8n & respond.io Workflow Workbench

A local environment for developing n8n Code node scripts and designing workflows for both n8n and respond.io.

## How it works

- `n8n/runner.js` wires up the n8n globals (`$input`) and executes the target `script.js`.
- `n8n/lib/n8n-globals.js` simulates the n8n Code node globals (`$input`, `$json`, and stubs). Use the `/n8n-runtime` skill for available globals and known gaps.

## Running a code node

```bash
npm run node -- <node-name>
```

## Folder structure

```
n8n/
  runner.js                # CLI entry point
  lib/
    n8n-globals.js         # simulates $input
  code-nodes/
    <node-name>/
      input.json           # array of input items
      script.js            # node logic using $input
  workflows/
    cloud/                 # n8n Cloud (production)
      <workflow-name>/
    local/                 # self-hosted community edition (no $vars)
      <workflow-name>/
respond/
  workflows/
    <workflow-name>/
```

## Coding, debugging, and fixing code nodes

When implementing, reviewing, or fixing any `script.js` file, apply the `/n8n-coder` skill guidelines automatically — even if not explicitly invoked.

## Scaffolding a new code node

When the user asks to create, add, or scaffold a node, the `/n8n-coder` skill handles scaffolding, conventions, and verification.

## n8n workflow creation and review

- n8n workflow files live under `n8n/workflows/cloud/` or `n8n/workflows/local/`.
- Use the `/n8n-architect` skill to create, assess, or improve n8n workflows.
- When reviewing a workflow, the improved file is saved alongside the original with a version suffix:
  - `<name>.json` → reviewed as `<name>_v2.json`
  - `<name>_v[n].json` → reviewed as `<name>_v[n+1].json`

## respond.io workflows

- respond.io workflow files live under `respond/workflows/`.
