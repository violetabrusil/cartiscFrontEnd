import useCSSVar from "../hooks/UseCSSVar";

export const useStatusColors = () => {

    const primaryColor = useCSSVar('--primary-color');
    const tertiaryColor = useCSSVar('--tertiary-color');
    const grayDark = useCSSVar('--gray-dark');
    const greenMedium = useCSSVar('--green-muted');
    const greenDark = useCSSVar('--green-dark');
    const yellowWarm = useCSSVar('--yellow-warm');
    const redIntense = useCSSVar('--red-intense');
    const orangeWarmLight = useCSSVar('--orange-warm-light');

    const statusColors = {
        "Por iniciar": tertiaryColor,
        "Asignada": primaryColor,
        "En desarrollo": greenMedium,
        "En pausa": yellowWarm,
        "Cancelada": redIntense,
        "Completada": greenDark,
        "Eliminada": grayDark,
        "Pendiente": orangeWarmLight,
        "Activo": greenMedium,
        "Suspendido": grayDark,
    };

    return statusColors;

};

