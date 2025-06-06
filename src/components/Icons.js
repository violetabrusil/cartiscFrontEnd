import React from "react";
import icons from "../assets/icons/icons";

const Icon = ({
    name,
    className = "",
    ...props }) => {

    const SvgIcon = icons[name];

    if (!SvgIcon) {
        return null 
    }

    return <SvgIcon className={className} {...props} />;
};

export default Icon;