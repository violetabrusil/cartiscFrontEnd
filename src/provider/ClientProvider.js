import React, { useState } from 'react';
import ClientContext from '../contexts/ClientContext';

function ClientProvider({ children }) {
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    return (
        <ClientContext.Provider value={{ selectedClient, setSelectedClient, selectedVehicle, setSelectedVehicle }}>
            {children}
        </ClientContext.Provider>
    );
}

export default ClientProvider;
