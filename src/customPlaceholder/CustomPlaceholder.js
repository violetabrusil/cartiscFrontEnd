import "../NewClient.css";
const categoryIcon = process.env.PUBLIC_URL + "/images/icons/category.png";

export const CustomPlaceholder = props => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '33px', marginTop: '-20px', color: '#999' }}>
            <img src={categoryIcon} alt="Category Icon" className="input-new-client-icon" style={{left: '5px'}} />
            {props.children}
        </div>
    );
};
