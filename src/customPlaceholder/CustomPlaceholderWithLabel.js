import "../NewClient.css";
import useCSSVar from "../hooks/UseCSSVar";

const categoryIcon = process.env.PUBLIC_URL + "/images/icons/category.png";


export const CustomPlaceholderWithLabel = props => {

    const grayMediumDark = useCSSVar('--gray-medium-dark');
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '39px', color: grayMediumDark }}>
            <img src={categoryIcon} alt="Category Icon" className="icon-new-value" />
            <span>Seleccione</span>
        </div>
    );
};
