import Icon from "../components/Icons";
import { components } from "react-select";

export const CustomValueContainer = (props) => {
    return (
        <components.ValueContainer {...props}>
            <Icon name="supplier" className="input-product-icon"/>
        
            {props.children}
        </components.ValueContainer>
    );
};
