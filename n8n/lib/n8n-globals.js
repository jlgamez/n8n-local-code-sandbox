export function setup(inputData, otherNodes = {}) {
  function normalize(raw) {
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.map(item =>
      item && typeof item === 'object' && 'json' in item ? item : { json: item }
    );
  }

  function makeProxy(data) {
    const items = normalize(data);
    return {
      all: () => items,
      first: () => items[0] ?? null,
      last: () => items[items.length - 1] ?? null,
      item: items[0] ?? null,
    };
  }

  const items = normalize(inputData);

  global.$input = makeProxy(inputData);
  global.$json  = items[0]?.json ?? null;

  global.$vars      = {};
  global.$env       = {};
  global.$workflow  = {};
  global.$execution = {};

  global.$ = (nodeName) => {
    if (!(nodeName in otherNodes)) {
      throw new Error(
        `No mock data for node "${nodeName}". ` +
        `Add other_node_${nodeName}.json to the node folder.`
      );
    }
    return makeProxy(otherNodes[nodeName]);
  };
}
