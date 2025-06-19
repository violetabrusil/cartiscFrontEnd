export const vehicleCategory = {
    car: "Automóvil",
    van: "Camioneta",
    bus: "Buseta",
    truck: "Camión",
    trailer: "Trailer",
    suv: "Suv",
    bicycle: "Bicicleta",
    motorcylce: "Motocicleta",
    tricycle: "Tricimoto",
    scooter: "Scooter",
    quad: "Quad",

};

export const getVehicleCategory = (category) => vehicleCategory[category] || category;