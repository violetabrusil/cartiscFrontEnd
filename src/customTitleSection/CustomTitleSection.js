import "../CustomTitleSection.css";
import React from "react";


const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const unavailableIcon = process.env.PUBLIC_URL + "/images/icons/unavailableIcon.png";
const editIcon = process.env.PUBLIC_URL + "/images/icons/editIcon.png";

const CustomTitleSection = ({
    title,
    onBack,
    onAdd,
    onEdit,
    onDisable,
    showAddIcon = false,
    showEditIcon = false,
    showDisableIcon = false
}) => {
    return (
        <div className="container-custom-title">
            {onBack && 
            <button onClick={onBack} className="button-arrow">
                <img src={arrowLeftIcon} className="arrow-icon" alt="Arrow Icon" />
            </button>
            }
            <h2>{title}</h2>
            {showAddIcon && onAdd &&
                <button onClick={onAdd} className="custom-button-add">
                    <img src={addIcon} className="custom-button-add-icon" alt="Add Icon" />
                </button>
            }
            {showDisableIcon && onDisable &&
                <button onClick={onDisable} className="custom-button-unavailable">
                    <img src={unavailableIcon} className="custom-button-unavailable-icon" alt="Unavailable Icon" />
                </button>
            }
            {showEditIcon && onEdit &&
                <button onClick={onEdit} className="custom-button-edit">
                   <img src={editIcon} className="custom-button-edit-icon" alt="Edit Icon" />
                </button>
            }

        </div>
    );
};

export default CustomTitleSection;
