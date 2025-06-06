import "../NewClient.css";
const categoryIcon = process.env.PUBLIC_URL + "/images/icons/category.png";

export const CustomSingleValue = ({ children }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '33px', marginTop: '-20px' }}>
            <img src={categoryIcon} alt="Category Icon" className="icon-new-value" style={{left: '5px'}} />
            {children}
        </div>
    );
};
