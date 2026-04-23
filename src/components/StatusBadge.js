const STATUS_CONFIG = {
    receivable: { label: "Por Cobrar", style: { background: "#FFD966", color: "black", border: "1px solid #FFD966" } },
    charged: { label: "Cobrada", style: { background: "#316EA8", color: "white", border: "1px solid #316EA8" } },
    cancelled: { label: "Cancelada", style: { background: "#ff5757", color: "white", border: "1px solid #ff5757" } }
};

export default function StatusBadge({ value }) {
    const config = STATUS_CONFIG[value] || { label: value, style: {} };

    return (
        <div style={{
            padding: "5px 10px",
            borderRadius: "15px",
            fontSize: "0.8rem",
            fontWeight: 500,
            display: "inline-block",
            textAlign: "center",
            whiteSpace: "nowrap",
            ...config.style
        }}>
            {config.label}
        </div>
    );
}