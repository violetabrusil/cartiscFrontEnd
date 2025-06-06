import React from "react";
import "./SectionTitle.css";

const SectionTitle = ({title}) => {

    return (
        <div className="section-title-container">
            <span className="section-title-text">
                {title}
            </span>

        </div>
    )

};

export default SectionTitle;