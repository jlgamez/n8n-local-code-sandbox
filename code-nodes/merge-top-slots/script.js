// CONFIG (make this dynamic later if needed)
const SLOTS_LIMIT = 10;

// 1. Collect all slots from all items
const allSlots = $input.all()
  .map(item => item.json);
  // each item.json = one slot tuple

// 2. Sort by datetime (index 0)
allSlots.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

// 3. Take top N
const topSlots = allSlots.slice(0, SLOTS_LIMIT);

// 4. Normalize output (optional but recommended)
const formatted = topSlots.map(slot => ({
  date: slot[0],
  professional_id: slot[1][0], // assuming 1 per array
  day_of_week: slot[2].day_of_week
}));

const result = [
  {
    json: {
      slots: formatted
    }
  }
];

console.log(JSON.stringify(result, null, 2));
