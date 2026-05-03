const { slots } = $input.first().json;
const agendas = $('Split matching agendas list').all();

const agendaByProfessional = Object.fromEntries(
  agendas.map(a => [a.json.professional_id, a.json])
);

const result = slots.map(({ date: isoDate, professional_id, day_of_week }) => {
  const [datePart, timePart] = isoDate.split('T');
  const [year, month, day] = datePart.split('-');

  const agenda = agendaByProfessional[professional_id];

  return {
    json: {
      day_of_week,
      date_iso: isoDate,
      date: `${day}/${month}/${year}`,
      time: timePart.slice(0, 5),
      professional: agenda?.professional_name ?? null,
      agenda_id: agenda?.agenda_id ?? null,
      center_id: agenda?.center_id ?? null,
      speciality_id: agenda?.requested_service?.speciality_id ?? null,
      duration: agenda?.requested_service?.duration ?? null,
    },
  };
});

const aggregated = [{ json: { slots: result.map(r => r.json) } }];

console.log(JSON.stringify(aggregated, null, 2));
