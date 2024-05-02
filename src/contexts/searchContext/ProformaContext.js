import React, { createContext, useContext, useState } from "react";

const ProformaContext = createContext();

export const ProformaProvider = ({ children, initialSelectedOptionProforma }) => {
    
    const [selectedOption, setSelectedOption] = useState(initialSelectedOptionProforma);
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <ProformaContext.Provider
            value={{ selectedOption, setSelectedOption, searchTerm, setSearchTerm }}
        >
            {children}
        </ProformaContext.Provider>
    );
};

export const useProformaContext = () => useContext(ProformaContext);
