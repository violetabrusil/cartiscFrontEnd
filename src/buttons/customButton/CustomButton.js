import "./CustomButton.css";
import React from "react";

const CustomButtonContainer = ({ containerClassName, children }) => {
    return (
        <div className={`container-custom-button ${containerClassName}`}>
            {children}
        </div>
    );
}

export default function CustomButton({
    onClick,
    variant = 'primary',
    fullWidth = false,
    disabled = false,
    type = 'button',
    title = '', 
}) {
    return (
        <button
            className={`custom-button ${variant} ${fullWidth ? 'full-width' : ''}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {title}
        </button>
    );
}


export { CustomButtonContainer };
