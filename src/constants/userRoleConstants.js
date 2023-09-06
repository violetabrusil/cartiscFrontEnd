export const userTypeMaping = {
    admin: "Administrador",
    operator: "Operador"
};

export const mapUserType = (type) => userTypeMaping[type] || type;