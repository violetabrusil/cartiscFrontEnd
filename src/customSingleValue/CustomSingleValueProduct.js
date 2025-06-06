import "../NewClient.css";
import useCSSVar from "../hooks/UseCSSVar";

const supplierIcon = process.env.PUBLIC_URL + "/images/icons/supplierIcon-blue.png";

export const CustomSingleValueProduct = (props) => {
    
    const grayMediumDark = useCSSVar('--gray-medium-dark');

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '-22px', color: grayMediumDark, marginLeft: "50px" }}>
            <img src={supplierIcon} alt="Supplier Icon" className="icon-new-value" style={{left: '6px'}}/>
            {props.children}
        </div>
    );
};
