export const vehicleCategory = {
    car: "Automóvil",
    suv: "SUV",
    van: "Buseta",
    pickup_truck: "Camioneta",
    truck: "Camión",
};

export const getVehicleCategory = (category) => vehicleCategory[category] || category;