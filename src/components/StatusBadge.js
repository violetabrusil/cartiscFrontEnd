const STATUS_CONFIG = {
    receivable: { label: "Por Cobrar", style: { background: "#FFD966", color: "black", border: "1px solid #c2a038" } },
    charged: { label: "Cobrada", style: { background: "#316EA8", color: "white", border: "1px solid #295e90" } },
    voided: { label: "Anulada", style: { background: "#9CA3AF", color: "white", border: "1px solid #807f7f" } }
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