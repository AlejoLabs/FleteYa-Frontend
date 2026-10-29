import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

interface UnreadSource {
    countUnreadMessages: (idClientRequest: number, myId: number) => Promise<number>;
    listenerTripMessage: (idClientRequest: number, callback: () => void) => () => void;
}

// Mensajes del chat sin leer, para el contador del botón. Se recuenta al volver a la pantalla (por ejemplo, al salir del chat)
// y suma los que llegan por el socket mientras la pantalla está a la vista
export const useUnreadMessages = (viewModel: UnreadSource, idClientRequest: number, myId?: number) => {
    const [unread, setUnread] = useState(0);

    useFocusEffect(useCallback(() => {
        if (!myId) return;
        let active = true;
        viewModel.countUnreadMessages(idClientRequest, myId).then((count) => {
            if (active) setUnread(count);
        });
        const off = viewModel.listenerTripMessage(idClientRequest, () => setUnread((current) => current + 1));
        return () => {
            active = false;
            off();
        };
    }, [idClientRequest, myId]));

    return unread;
}
