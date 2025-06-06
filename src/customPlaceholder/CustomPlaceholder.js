import "../NewClient.css";
import useCSSVar from "../hooks/UseCSSVar";

const categoryIcon = process.env.PUBLIC_URL + "/images/icons/category.png";

export const CustomPlaceholder = props => {

    const grayMediumDark = useCSSVar('--gray-medium-dark');
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '33px', marginTop: '-20px', color: grayMediumDark }}>
            <img src={categoryIcon} alt="Category Icon" className="icon-new-value" style={{left: '5px'}} />
            {props.children}
        </div>
    );
};
