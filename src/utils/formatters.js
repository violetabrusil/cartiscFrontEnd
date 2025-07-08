export const formatPlate = (plateInput) => {
    const regex = /^([A-Z]{3})(\d{3,4})$/;

    if (regex.test(plateInput)) {
        return plateInput.replace(
            regex,
            (match, p1, p2) => {
                return p1 + "-" + p2;
            }
        );
    }
    return plateInput;
};

export function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
};