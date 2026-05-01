const { slots } = $input.first().json;
const agendas = $('Split matching agendas list').all();

const agendaByProfessional = Object.fromEntries(
  agendas.map(a => [a.json.professional_id, a.json])
);

const result = slots.map(({ date: isoDate, professional_id, day_of_week }) => {
  const [datePart, timePart] = isoDate.split('T');
  const [year, month, day] = datePart.split('-');

  return {
    json: {
      day_of_week,
      date: `${day}/${month}/${year}`,
      time: timePart.slice(0, 5),
      professional: agendaByProfessional[professional_id]?.professional_name ?? null,
    },
  };
});

console.log(JSON.stringify(result, null, 2));
