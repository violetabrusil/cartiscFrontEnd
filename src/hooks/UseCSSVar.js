import { useState, useEffect } from "react";

const useCSSVar = (variableName) => {

    const [value, setValue] = useState('');

    useEffect(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        const cssVar = rootStyle.getPropertyValue(variableName).trim();
        if (cssVar) {
            setValue(cssVar);
        }

    }, [variableName]);
    
    return value;    
};

export default useCSSVar;