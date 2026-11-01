import { useEffect, useRef, useState } from "react";
import { LatLng } from "react-native-maps";
import { ClientRequestResponse } from "../../../../../domain/models/ClientRequestResponse";
import { DriverCarInfo } from "../../../../../domain/models/DriverCarInfo";
import { ErrorResponse } from "../../../../../domain/models/ErrorResponse";
import { Photo } from "../../../../../domain/models/Photo";
import { Status } from "../../../../../domain/repository/ClientRequestRepository";
import { useToast } from "../../../../components/ui";
import { formatErrorMessage } from "../../../../utils/Formatters";
import { ClientTripMapViewModel } from "../ClientTripMapViewModel";

interface Callbacks {
    // La carga se entregó: se pasa a pagar
    onFinished: (request: ClientRequestResponse) => void;
    // Viaje cancelado por cualquiera de los dos
    onLeft: () => void;
}

// Estado del viaje del lado del cliente: el paso en que va, dónde está el conductor, sus fotos, confirmar la entrega y cancelar
export function useClientTrip(viewModel: ClientTripMapViewModel, idClientRequest: number, idDriver: number, callbacks: Callbacks) {
    const { showToast } = useToast();
    const [request, setRequest] = useState<ClientRequestResponse | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [status, setStatus] = useState<string>(Status.ACCEPTED);
    const [driverPosition, setDriverPosition] = useState<LatLng | null>(null);
    const [carInfo, setCarInfo] = useState<DriverCarInfo | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [confirming, setConfirming] = useState(false);
    // Respaldo del código de entrega: se activa si el conductor agota los intentos
    const [deliveryLocked, setDeliveryLocked] = useState(false);

    // Los avisos del socket llegan a funciones registradas una sola vez: leen lo último por referencia
    const callbacksRef = useRef(callbacks);
    callbacksRef.current = callbacks;
    const requestRef = useRef<ClientRequestResponse | null>(null);
    const listeners = useRef<(() => void)[]>([]);
    const finished = useRef(false);

    const loadPhotos = async () => {
        const response = await viewModel.getTripPhotos(idClientRequest);
        if (Array.isArray(response)) setPhotos(response);
    }

    const load = async () => {
        setLoadFailed(false);
        const response = await viewModel.getClientRequestById(idClientRequest);
        if (!('id' in response)) {
            setLoadFailed(true);
            return;
        }
        requestRef.current = response;
        setRequest(response);
        setStatus(response.status);
        setDeliveryLocked(Boolean(response.delivery_locked));

        const driverId = response.id_driver_assigned ?? idDriver;
        listeners.current.push(
            viewModel.listenerDriverPositionSocket(response.id_client, driverId, (data: any) => {
                setDriverPosition({ latitude: data.lat, longitude: data.lng });
            }),
            viewModel.listenerUpdateStatusSocket(idClientRequest, (data: any) => {
                if (data?.status) setStatus(data.status);
            }),
        );
        const car = await viewModel.getDriverCarInfo(driverId);
        if ('brand' in car) setCarInfo(car);
    }

    useEffect(() => {
        viewModel.initSocket();
        load();
        loadPhotos();
        listeners.current.push(
            viewModel.listenerTripCanceled(idClientRequest, (reason) => {
                showToast(`El conductor canceló el viaje${reason ? `: ${reason}` : ''}`, 'error');
                callbacksRef.current.onLeft();
            }),
            // El conductor tomó una foto al cargar o al entregar
            viewModel.listenerTripPhoto(idClientRequest, loadPhotos),
            viewModel.listenerDeliveryLocked(idClientRequest, () => {
                setDeliveryLocked(true);
                showToast('El conductor no pudo cerrar con el código: confirma tú si ya tienes la carga', 'info');
            }),
        );
        return () => {
            listeners.current.forEach((off) => off());
            listeners.current = [];
        };
    }, [idClientRequest]);

    // Entregado (con el código que dictó quien recibe o confirmado por el cliente): una sola vez a calificar
    useEffect(() => {
        if (status !== Status.FINISHED || finished.current || !requestRef.current) return;
        finished.current = true;
        callbacksRef.current.onFinished(requestRef.current);
    }, [status]);

    // Respaldo del código: solo cuando el conductor agotó los intentos
    const confirmDelivery = async () => {
        setConfirming(true);
        const response = await viewModel.confirmDelivery(idClientRequest);
        setConfirming(false);
        if (response === true) {
            showToast('Entrega confirmada', 'success');
            setStatus(Status.FINISHED);
            return true;
        }
        showToast(formatErrorMessage((response as ErrorResponse).message), 'error');
        return false;
    }

    const cancel = async (reason: string) => {
        const response = await viewModel.cancelTrip(idClientRequest, reason);
        if (response === true) {
            showToast('Cancelaste el flete', 'info');
            callbacksRef.current.onLeft();
        } else {
            showToast(formatErrorMessage((response as ErrorResponse).message), 'error');
        }
    }

    return { request, loadFailed, reload: load, status, driverPosition, carInfo, photos, deliveryLocked, confirming, confirmDelivery, cancel };
}
