import { createContext } from 'react';

const StateContext = createContext({
  resetStates: () => {}, // Una función vacía como valor predeterminado
});

export default StateContext;