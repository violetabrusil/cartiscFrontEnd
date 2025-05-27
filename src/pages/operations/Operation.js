import "../../Operation.css";
import React, { useState } from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import OperationRightSection from "./OperationRightSection";

const Operation = () => {

    const [showAddOperation, setShowAddOperation] = useState(true);
    const [showEditOperation, setShowEditOperation] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
    }

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="two-column-layout"> 
                <div className="left-section-operation"></div>
                <OperationRightSection
                    showAddOperation={showAddOperation}
                    showEditOperation={showEditOperation}
                    isEditing={isEditing}
                    handleEditClick={handleEditClick}
                />
            </div>

        </div>
    )


};

export default Operation;