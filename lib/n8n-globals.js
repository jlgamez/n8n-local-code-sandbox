export function setup(inputData) {
  const raw = Array.isArray(inputData) ? inputData : [inputData];
  // Normalize to n8n item shape: { json: {}, binary: {} }
  const items = raw.map(item =>
    item && typeof item === 'object' && 'json' in item ? item : { json: item }
  );

  global.$input = {
    all: () => items,
    first: () => items[0] ?? null,
    last: () => items[items.length - 1] ?? null,
    item: items[0] ?? null,
  };

  global.$json = items[0]?.json ?? null;

  // Stubs — prevent ReferenceErrors in pasted code that references these
  global.$vars = {};
  global.$env = {};
  global.$workflow = {};
  global.$execution = {};
}
