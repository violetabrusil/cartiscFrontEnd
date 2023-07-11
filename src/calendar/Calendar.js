import "../Car.css"
import React from "react";
import calendarIcon from "../images/icons/calendarIcon.png";

export const Calendar = React.forwardRef(({ value, onClick }, ref) => (
    <img
        className="icon-calendar"
        src={calendarIcon}
        alt="Calendar"
        onClick={onClick}
        ref={ref}
        style={{ cursor: 'pointer' }} // Esto cambia el cursor a un puntero cuando se pasa por encima
    />
));

