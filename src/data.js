import faker from "faker";
import moment from "moment";

const nextId = ((n = 0) => () => n++)();
const nextAppointmentId = () => `appt-${nextId()}`;
const nextCrewId = () => `crew-${nextId()}`;

const createCrew = () => ({
  id: nextCrewId(),
  name: `LLC ${faker.name.findName()} Corp.`
});

const createAppointment = duration => ({
  id: nextAppointmentId(),
  duration,
  homeowner: faker.name.findName(),
  project: `33-${100000 + nextId()}`
});

const createAppointmentSlot = (crew, date, shift, duration = 1) => ({
  id: nextId(),
  date,
  shift,
  crew,
  appointment: createAppointment(duration)
});

const createAvailableSlot = (crew, date, shift, _duration = 1) => ({
  id: nextId(),
  date,
  shift,
  crew
});

const dates = [
  moment("2019-11-03"),
  moment("2019-11-04"),
  moment("2019-11-05"),
  moment("2019-11-06"),
  moment("2019-11-07"),
  moment("2019-11-08"),
  moment("2019-11-09")
];

const crew1 = createCrew();
const crew2 = createCrew();
const crew3 = createCrew();
const crew4 = createCrew();

export default {
  dates,
  crews: [crew1, crew2, crew3, crew4],
  slots: [
    createAvailableSlot(crew1, dates[0], "morning"),
    createAvailableSlot(crew1, dates[1], "afernoon"),
    createAvailableSlot(crew1, dates[2], "fullday"),
    createAvailableSlot(crew1, dates[4], "fullday"),
    createAppointmentSlot(crew1, dates[5], "fullday", 2),

    createAppointmentSlot(crew2, dates[0], "fullday"),
    createAppointmentSlot(crew2, dates[2], "fullday", 3),
    createAvailableSlot(crew2, dates[5], "morning"),
    createAvailableSlot(crew2, dates[6], "afternoon"),

    createAppointmentSlot(crew3, dates[0], "fullday", 3),
    createAppointmentSlot(crew3, dates[3], "fullday"),
    createAvailableSlot(crew3, dates[4], "afernoon"),
    createAvailableSlot(crew3, dates[5], "morning"),
    createAvailableSlot(crew3, dates[6], "afternoon"),

    createAppointmentSlot(crew4, dates[0], "fullday", 2),
    createAppointmentSlot(crew4, dates[2], "fullday", 2),
    createAvailableSlot(crew4, dates[4], "afernoon"),
    createAvailableSlot(crew4, dates[6], "afternoon")
  ]
};
