import apiClient from "./apiClient";

export const PaymentService = {

    getPaymentBySale: async (paymentId) => {
        try {
            const res = await apiClient.get(`/payments/${paymentId}`);
            console.log("data payment", res.data)
            return res.data;
        } catch (error) {
            throw error;
        }
    },

    registerPayment: async (paymentId, form) => {
        try {
            console.log("🔍 registrando pago:", paymentId, form);
            const res = await apiClient.post(`/payments/${paymentId}/record`, {
                amount: form.amount,
                method: form.method,
                occurred_at: new Date(`${form.date}T00:00:00`).toISOString(),
                reference: form.reference || null,
                currency: "USD"
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },

    getRecords: async (paymentId, { method, status, reference, page = 1, pageSize = 10 } = {}) => {
        const params = new URLSearchParams();
        if (method) params.append("method", method);
        if (status) params.append("status", status);
        if (reference) params.append("reference", reference);
        params.append("page", page);
        params.append("page_size", pageSize);

        const res = await apiClient.get(`/payments/${paymentId}/records?${params.toString()}`);
        return res.data;
    },

    voidPayment: async (paymentId, recordId, { reason, reversal_type, reversal_reason, occurred_at }) => {
        const body = { reason, occurred_at, reversal_type };
        if (reversal_reason) body.reversal_reason = reversal_reason;

        console.log("🔵 void payload →", JSON.stringify(body, null, 2));

        const res = await apiClient.put(`/payments/${paymentId}/records/${recordId}/annul`, body);
        return res.data;
    },

    downloadRecordPdf: async (recordId) => {
        try {
            const response = await apiClient.get(
                `/payments/generate-record-pdf/${recordId}`,
                { responseType: 'blob' }
            );

            const header = response.headers['content-disposition'];
            const fileName = header
                ? header.split('filename=')[1].replace(/['"]/g, '')
                : `comprobante-${recordId}.pdf`;

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            const text = await error.response?.data?.text();
            console.error('Error del backend:', text);
            throw error;
        }
    },
};
