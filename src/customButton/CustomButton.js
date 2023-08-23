import "../CustomButton.css";
import React from "react";

const CustomButtonContainer = ({ containerClassName, children }) => {
    return (
        <div className={`container-custom-button ${containerClassName}`}>
            {children}
        </div>
    );
}

const CustomButton = ({ title, onClick, className, buttonClassName, ...props }) => {
    return (
        <button className={`custom-button ${buttonClassName} ${className}`} onClick={onClick} {...props}>
            <span className="span-custom-button">{title}</span>
        </button>
    );
}

export { CustomButtonContainer, CustomButton };
