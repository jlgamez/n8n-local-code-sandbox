const items = $input.all();

const result = items.map(item => ({
  json: {
    ...item.json,
    grade: item.json.score >= 80 ? 'pass' : 'fail',
  },
}));

console.log(JSON.stringify(result, null, 2));
