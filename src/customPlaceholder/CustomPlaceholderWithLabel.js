import "../NewClient.css";
const categoryIcon = process.env.PUBLIC_URL + "/images/icons/category.png";

export const CustomPlaceholderWithLabel = props => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '39px', color: '#999' }}>
            <img src={categoryIcon} alt="Category Icon" className="input-new-client-icon" />
            <span>Seleccione</span>
        </div>
    );
};
