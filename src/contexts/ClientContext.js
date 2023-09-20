import React from 'react';

const ClientContext = React.createContext({
    selectedClient: null,
    setSelectedClient: () => {}  // función vacía como valor predeterminado para evitar errores
  });
  

export default ClientContext;
