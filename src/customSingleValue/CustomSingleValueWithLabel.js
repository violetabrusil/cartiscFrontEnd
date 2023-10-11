import "../NewClient.css";

export const CustomSingleValueWithLabel = ({ data }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '39px', marginTop: '-20px' }}>
            <img src={data.icon} alt={data.label} className="icon-role-option" />
            <span>{data.label}</span>
        </div>
    );
};
