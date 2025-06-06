import React from "react";
import "../customColorContainer/CustomColorContainer.css";
export const CustomColorContainer = ({
    statusColors,
    value,
}) => {

    const color = statusColors[value];

    return (
        <div className="custom-color-container"
            style={{ background: `linear-gradient(45deg, ${color}25, ${color}25)`, color: `${color}`}}>
                {value}
        </div>
    )

};