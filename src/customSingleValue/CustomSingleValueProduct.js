import "../NewClient.css";
const supplierIcon = process.env.PUBLIC_URL + "/images/icons/supplierIcon-blue.png";

export const CustomSingleValueProduct = (props) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '-22px', color: '#999', marginLeft: "50px" }}>
            <img src={supplierIcon} alt="Supplier Icon" className="input-new-client-icon" style={{left: '6px'}}/>
            {props.children}
        </div>
    );
};
