import React from "react";
import "../customColorContainer/CustomColorContainer.css";
import useCSSVar from "../hooks/UseCSSVar";

export const CustomColorContainer = ({ color, value }) => {
    const gray = useCSSVar('--gray-dark');
    let resolvedColor = gray;

    if (typeof color === 'function') {
        resolvedColor = color(value); 
    } else if (typeof color === 'string') {
        resolvedColor = color;
    } else if (typeof color === 'object' && color !== null) {
        resolvedColor = color[value] || color.default || '#ccc';
    }

    return (
        <div
            className="custom-color-container"
            style={{
                background: `linear-gradient(45deg, ${resolvedColor}25, ${resolvedColor}25)`,
                color: resolvedColor,
            }}
        >
            {value}
        </div>
    );
};

