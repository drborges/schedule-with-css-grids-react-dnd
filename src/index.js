import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { DndProvider, useDrop, useDrag } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import draggables from "./draggables";
import schedule from "./data";

const colName = date => `col-${date.format("YYYY-MM-DD")}`;
const rowName = crew => `row-${crew.id}`;

const Schedule = styled.div`
  display: grid;
  column-gap: 10px;
  font-family: sans-serif;
  color: #666;
  row-gap: 10px;
  grid-template-areas:
    ${props => `"${"day ".repeat(props.dates.length)}"`}
    ${props => props.crews.map(c => `"${"slot ".repeat(props.dates.length)}"`)};
  grid-template-columns: ${props =>
    props.dates.map(date => `[${colName(date)}] minmax(200px, 1fr) `)};
  grid-template-rows:
    [row-header] 50px
    ${props => props.crews.map(c => `[${rowName(c)}] minmax(100px, 1fr) `)};
`;

const Header = styled.div`
  border: thin solid #eee;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Slot = styled.div`
  grid-column: ${props => colName(props.date)};
  grid-row: ${props => rowName(props.crew)} / span 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: background-color 0.5s ease;
`;

const AppointmentSlot = styled(Slot)`
  z-index: 2;
  color: ${props => (props.dragging ? "#fff" : "inherit")};
  background-color: ${props => (props.dragging ? "#fff" : "#97f7bd")};
  border: thin solid ${props => (props.dragging ? "#fff" : "#97f7bd")};
  /* filter: ${props => (props.dragging ? "blur(5px)" : "blur(0)")}; */
  grid-column: ${props => colName(props.date)} / span
    ${props => props.appointment.duration};
  cursor: pointer;
`;

const AvailableSlot = styled(Slot)`
  z-index: 1;
  border: thin dashed #4287f5;
  background-color: ${props =>
    props.droppable && !props.over ? "#a3d3ff" : "#fff"};
`;

const NotAvailableSlot = styled(Slot)`
  background-color: #ddd;
  border: thin solid #ddd;
  opacity: 0.3;
  z-index: 0;
`;

const onInvalidDrop = () => {
  console.warn("This slot can't handle this appointment");
};
const DroppableAvailableSlot = ({ accept, children, onDrop, ...props }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: data => (canDrop ? onDrop(data) : onInvalidDrop),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  return (
    <AvailableSlot {...props} ref={drop} droppable={canDrop} over={isOver}>
      {children}
    </AvailableSlot>
  );
};

const DraggableAppointmentSlot = ({ children, ...props }) => {
  const [{ dragging }, drag] = useDrag({
    item: { ...props },
    collect: monitor => ({
      dragging: monitor.isDragging()
    })
  });

  return (
    <AppointmentSlot ref={drag} {...props} dragging={dragging}>
      {children}
    </AppointmentSlot>
  );
};

function App() {
  const [slots, setSlots] = useState(schedule.slots);
  const handleDrop = useCallback(
    ({ type, ...fromSlot }, toSlot) => {
      const sourceSlot = {
        ...fromSlot,
        appointment: null
      };

      const targetSlot = {
        ...toSlot,
        appointment: fromSlot.appointment
      };

      const updatedSlots = slots
        .filter(s => s.id !== fromSlot.id && s.id !== toSlot.id)
        .concat([sourceSlot, targetSlot]);

      setSlots(updatedSlots);
    },
    [slots]
  );

  return (
    <Schedule dates={schedule.dates} crews={schedule.crews}>
      {/*
        Render Dates header
      */}
      {schedule.dates.map((date, index) => (
        <Header key={index}>{date.format("MMM Do")}</Header>
      ))}

      {/*
        Builds up the entire grid first with "Not Available" slots.
      */}
      {schedule.crews.map(crew =>
        schedule.dates.map(date => (
          <NotAvailableSlot key={date} date={date} crew={crew}>
            Not Available
          </NotAvailableSlot>
        ))
      )}

      {/*
        Overlays "Not Available" slots with available appointment slots if present
      */}
      {slots
        .filter(slot => slot.appointment)
        .map((slot, index) => (
          <DraggableAppointmentSlot
            key={index}
            {...slot}
            type={draggables.APPOINTMENT}
          >
            <span>{slot.appointment.project}</span>
            <small>{slot.crew.name}</small>
          </DraggableAppointmentSlot>
        ))}

      {/*
        Overlays "Not Available" slots with regular available slots if present
      */}
      {slots
        .filter(slot => !slot.appointment)
        .map((slot, index) => (
          <DroppableAvailableSlot
            accept={[draggables.APPOINTMENT]}
            key={index}
            onDrop={appointment => handleDrop(appointment, slot)}
            {...slot}
          >
            <span>{slot.shift.toUpperCase()}</span>
            <small>{slot.crew.name}</small>
          </DroppableAvailableSlot>
        ))}
    </Schedule>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>,
  rootElement
);
