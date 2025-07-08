import "../CustomTitleSection.css";
import React, { useState, useEffect } from "react";
import Icon from "../components/Icons";

const CustomTitleSection = ({
    title,
    titlePrefix = "",
    onBack,
    onAdd,
    onEdit,
    onDisable,
    onDelete,
    onFilter,
    showAddIcon = false,
    showEditIcon = false,
    showDisableIcon = false,
    showFilterIcon = false,
    showDeleteIcon = false,
    onCustomButtonClick,
    customButtonLabel,
    showCustomButton,
}) => {

    const [showSaveButton, setShowSaveButton] = useState(showCustomButton);

    useEffect(() => {
        if (showCustomButton) {
            setShowSaveButton(true);
        } else if (!showAddIcon && !showEditIcon && !showDisableIcon && !showDeleteIcon) {
            setShowSaveButton(true);
        } else {
            setShowSaveButton(false);
        }
    }, [showAddIcon, showDisableIcon, showDeleteIcon, showEditIcon, showCustomButton]);

    return (

        <div className="container-custom-title">
            <div className="left-section">
                {onBack &&
                    <button onClick={onBack} className="button-arrow">
                        <Icon name="leftArrow" className="arrow-icon" />
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
                        <Icon name="add" className="custom-button-add-icon" />
                    </button>
                }
                {showDisableIcon && onDisable &&
                    <button onClick={onDisable} className="custom-button-unavailable">
                        <Icon name="noHidden" className="custom-button-unavailable-icon" />
                    </button>
                }
                {showDeleteIcon && onDelete &&
                    <button onClick={onDelete} className="custom-button-delete">
                        <Icon name="delete" className="custom-button-delete-icon" />
                    </button>
                }
                {showEditIcon && onEdit &&
                    <button onClick={onEdit} className="custom-button-edit">
                        <Icon name="edit" className="custom-button-edit-icon" />
                    </button>
                }
                {showSaveButton && onCustomButtonClick && customButtonLabel &&
                    <button className="custom-button-save" onClick={onCustomButtonClick}>
                        {customButtonLabel}
                    </button>
                }

                {showFilterIcon &&
                    <button onClick={onFilter} className="button-maintenance-filter">
                        <Icon name="filter" className="filter-icon" />
                        <span className="button-maintenance-text-filter">Filtro</span>
                    </button>
                }

            </div>
        </div>


    );
};

export default CustomTitleSection;
