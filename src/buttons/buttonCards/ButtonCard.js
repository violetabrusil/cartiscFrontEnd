import Icon from "../../components/Icons";
import "../buttonCards/ButtonCard.css"
import React from "react";


export const ButtonCard = ({
    icon,
    labelSticker,
    title,
    description,
    onClick,
}) => {
    return (
        <div className="container-general-button-card" >
            <div className="container-button-card" onClick={onClick}>

                <div className="container-icon-center">
                    <Icon name={icon} className="button-card-icon" />
                </div>

                <div className="container-button-content">
                    {labelSticker && (
                        <div className="container-label-sticker">{labelSticker}</div>
                    )}
                    <div className="container-button-card-title">
                        {title}
                    </div>
                    {description && (
                        <div className="container-button-card-description">{description}</div>
                    )}
                </div>

            </div>
        </div>

    )

};