let salesDB = {
    "VTA-1042": {
        id: "VTA-1042",
        total: 500,
        amountPaid: 200,
        balance: 300,
        status: "partial",
        date: "14 Feb 2026",
        workOrderCode: "ORT-0003425",
        client: "Luis Ramírez",
    },
};

let paymentsDB = [
    { id: "AB-001", date: "14 Feb 2026", amount: 15000, method: "transfer", status: "confirmed", reference: "TRF-88291", voidedAt: null, voidedBy: null, voidReason: null },
    { id: "AB-002", date: "20 Feb 2026", amount: 8500, method: "cash", status: "confirmed", reference: null, voidedAt: null, voidedBy: null, voidReason: null },
    { id: "AB-003", date: "25 Feb 2026", amount: 5000, method: "card", status: "pending", reference: "DEB-4421", voidedAt: null, voidedBy: null, voidReason: null },
];

export const PaymentService = {

    getSale: async (saleId) => {
        await delay(300);
        const sale = salesDB[saleId];
        if (!sale) throw new Error("Venta no encontrada");
        return sale;
    },

    registerPayment: async (saleId, form) => {
        await delay(400);
        const sale = salesDB[saleId];

        if (sale.balance <= 0) {
            throw new Error("SALE_ALREADY_PAID");
        }

        const newPayment = {
            id: `AB-${Date.now()}`,
            date: form.date,
            amount: parseFloat(form.amount),
            method: form.method,
            status: "pending",
            reference: form.reference || null,
            voidedAt: null, voidedBy: null, voidReason: null,
        };

        sale.amountPaid += newPayment.amount;
        sale.balance = sale.total - sale.amountPaid;

        if (sale.balance <= 0) {
            sale.balance = 0;
            sale.status = "paid";
        } else {
            sale.status = "partial";
        }

        return { payment: newPayment, sale };
    },

    voidPayment: async (saleId, paymentId, reason) => {
        await delay(300);
        return { success: true };
    },

    confirmPayment: async (paymentId) => {
        await delay(600);
        return { id: paymentId, status: "confirmed" };
    },
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));