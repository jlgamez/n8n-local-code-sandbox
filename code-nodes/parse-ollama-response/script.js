const items = $input.all();

const result = items.map(item => ({
  json: JSON.parse(item.json.content),
}));

console.log(JSON.stringify(result, null, 2));
