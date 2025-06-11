import "../CustomTitleSection.css";
import React, { useState, useEffect } from "react";
import Icon from "../components/Icons";

const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const editIcon = process.env.PUBLIC_URL + "/images/icons/editIcon.png";
const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";

const CustomTitleSection = ({
    title,
    titlePrefix = "",
    onBack,
    onAdd,
    onEdit,
    onDisable,
    onFilter,
    showAddIcon = false,
    showEditIcon = false,
    showDisableIcon = false,
    showFilterIcon = false,
    onCustomButtonClick,
    customButtonLabel,
    showCustomButton,
}) => {

    const [showSaveButton, setShowSaveButton] = useState(showCustomButton);

    useEffect(() => {
        if (showCustomButton) {
            setShowSaveButton(true);
        } else if (!showAddIcon && !showEditIcon && !showDisableIcon) {
            setShowSaveButton(true);
        } else {
            setShowSaveButton(false);
        }
    }, [showAddIcon, showDisableIcon, showEditIcon, showCustomButton]);

    return (

        <div className="container-custom-title">
            <div className="left-section">
                {onBack &&
                    <button onClick={onBack} className="button-arrow">
                        <img src={arrowLeftIcon} className="arrow-icon" alt="Arrow Icon" />
                    </button>
                }
                {titlePrefix && <span className="title-prefix">{titlePrefix}</span>}
            </div>

            <div className="center-title">
                <span className="title">{title}</span>
            </div>

            <div className="right-actions">


                {showAddIcon && onAdd &&
                    <button onClick={onAdd} className="custom-button-add">
                        <img src={addIcon} className="custom-button-add-icon" alt="Add Icon" />
                    </button>
                }
                {showDisableIcon && onDisable &&
                    <button onClick={onDisable} className="custom-button-unavailable">
                        <Icon name="noHidden" className="custom-button-unavailable-icon" />
                    </button>
                }
                {showEditIcon && onEdit &&
                    <button onClick={onEdit} className="custom-button-edit">
                        <img src={editIcon} className="custom-button-edit-icon" alt="Edit Icon" />
                    </button>
                }

                {showSaveButton && onCustomButtonClick && customButtonLabel &&
                    <button className="custom-button-save" onClick={onCustomButtonClick}>
                        {customButtonLabel}
                    </button>
                }

                {showFilterIcon &&
                    <button onClick={onFilter} className="button-maintenance-filter">
                        <img src={filterIcon} alt="Filter Icon" className="filter-icon"/>
                        <span className="button-maintenance-text-filter">Filtro</span>
                    </button>
                }

            </div>
        </div>


    );
};

export default CustomTitleSection;
