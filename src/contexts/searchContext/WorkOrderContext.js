import React, { createContext, useContext, useState } from "react";

const WorkOrderContext = createContext();

export const WorkOrderProvider = ({ children, initialSelectedOptionWorkOrder }) => {
    
    const [selectedOption, setSelectedOption] = useState(initialSelectedOptionWorkOrder);
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <WorkOrderContext.Provider
            value={{ selectedOption, setSelectedOption, searchTerm, setSearchTerm }}
        >
            {children}
        </WorkOrderContext.Provider>
    );
};

export const useWorkOrderContext = () => useContext(WorkOrderContext);
