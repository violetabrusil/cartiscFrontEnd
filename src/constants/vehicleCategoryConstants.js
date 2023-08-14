export const vehicleCategory = {
    car: "Automóvil",
    van: "Camioneta",
    bus: "Buseta",
    truck: "Camión",
};

export const getVehicleCategory = (category) => vehicleCategory[category] || category;