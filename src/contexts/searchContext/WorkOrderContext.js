import React, { createContext, useContext, useState } from "react";

const WorkOrderContext = createContext();

export const WorkOrderProvider = ({ children, initialSelectedOptionWorkOrder }) => {

    const [selectedOption, setSelectedOption] = useState(initialSelectedOptionWorkOrder);
    const [searchTerm, setSearchTerm] = useState("");
    const [workOrders, setWorkOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalValues, setTotalValues] = useState("");

    return (
        <WorkOrderContext.Provider
            value={{
                selectedOption, setSelectedOption,
                searchTerm, setSearchTerm,
                workOrders, setWorkOrders,
                page, setPage,
                hasMore, setHasMore,
                totalValues, setTotalValues
            }}
        >
            {children}
        </WorkOrderContext.Provider>
    );
};

export const useWorkOrderContext = () => useContext(WorkOrderContext);
