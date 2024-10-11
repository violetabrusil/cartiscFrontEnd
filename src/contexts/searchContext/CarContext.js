import React, { createContext, useContext, useState } from "react";

const CarContext = createContext();

export const CarProvider = ({ children, initialSelectedOptionCar }) => {

    const [selectedOption, setSelectedOption] = useState(initialSelectedOptionCar);
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <CarContext.Provider 
            value={{ selectedOption, setSelectedOption, searchTerm, setSearchTerm }}
        >
            {children}
        </CarContext.Provider>
    );
};

export const useCarContext = () => useContext(CarContext);