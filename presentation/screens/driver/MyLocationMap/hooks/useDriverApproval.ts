import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { DriverCarInfo } from "../../../../../domain/models/DriverCarInfo";
import { DriverMyLocationMapViewModel } from "../DriverMyLocationMapViewModel";

// Vehículo del conductor y si ya puede recibir fletes. Se recarga al volver a la pantalla (por ejemplo, después de
// corregir los datos del vehículo) y al instante cuando el admin lo aprueba o lo rechaza
export function useDriverApproval(viewModel: DriverMyLocationMapViewModel, idDriver: number | undefined) {
    const [carInfo, setCarInfo] = useState<DriverCarInfo | null>(null);

    const load = useCallback(async () => {
        if (!idDriver) return;
        const car = await viewModel.getDriverCarInfo(idDriver);
        if ('brand' in car) setCarInfo(car);
    }, [idDriver]);

    useFocusEffect(useCallback(() => {
        load();
    }, [load]));

    useEffect(() => {
        if (!idDriver) return;
        return viewModel.listenerDriverReviewed(load);
    }, [idDriver, load]);

    return {
        carInfo,
        // null mientras carga: así no se pone disponible antes de saber si puede
        canWork: carInfo ? !carInfo.block_reason : null,
        notice: viewModel.approvalNotice(carInfo),
    };
}
