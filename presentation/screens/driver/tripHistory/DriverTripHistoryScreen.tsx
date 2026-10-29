import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import TripHistoryList from "../../trip/history/TripHistoryList";
import { DriverTripHistoryViewModel } from "./DriverTripHistoryViewModel";

// Fletes que el conductor ya entregó
export function DriverTripHistoryScreen() {
    const viewModel: DriverTripHistoryViewModel = container.resolve("driverTripHistoryViewModel");
    const { authResponse } = useAuth();
    return <TripHistoryList role="DRIVER" load={() => viewModel.getByDriverAssigned(authResponse?.user.id!)} />;
}
