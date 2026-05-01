const agendas = $input.first().json.agendas;

const professionals = agendas.map(agenda => ({
  json: {
    agenda_id: agenda.agenda_id,
    professional_id: agenda.professional_id,
    professional_name: agenda.professional_name,
  },
}));

console.log(professionals);