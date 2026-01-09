import React from 'react';

const ClientContext = React.createContext({
    selectedClient: null,
    setSelectedClient: () => {}  
  });
  

export default ClientContext;
