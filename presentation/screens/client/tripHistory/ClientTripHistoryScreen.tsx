import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import TripHistoryList from "../../trip/history/TripHistoryList";
import { ClientTripHistoryViewModel } from "./ClientTripHistoryViewModel";

// Fletes que el cliente ya recibió
export function ClientTripHistoryScreen() {
    const viewModel: ClientTripHistoryViewModel = container.resolve("clientTripHistoryViewModel");
    const { authResponse } = useAuth();
    return <TripHistoryList role="CLIENT" load={() => viewModel.getByClientAssigned(authResponse?.user.id!)} />;
}
