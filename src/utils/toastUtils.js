import { toast } from "react-toastify";

const activeToasts = new Set();

export const showToastOnce = (type, message, options = {}) => {

    const toastId = options.toastId || message;

    if (activeToasts.has(toastId)) {
        return;
    }

    activeToasts.add(toastId);

    const defaultOptions = {
        position: toast.POSITION.TOP_RIGHT,
        toastId,
        onClose: () => activeToasts.delete(toastId),
        ...options
    };

    switch (type) {
        case 'info':
            toast.info(message, defaultOptions);
            break;
        case 'success':
            toast.success(message, defaultOptions);
            break;
        case 'error':
            toast.error(message, defaultOptions);
            break;
        case 'warn':
            toast.warn(message, defaultOptions);
            break;
        default:
            toast(message, defaultOptions);
    }

};