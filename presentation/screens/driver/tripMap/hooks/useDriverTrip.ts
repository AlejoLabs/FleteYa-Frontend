import { useEffect, useRef, useState } from "react";
import { ClientRequestResponse } from "../../../../../domain/models/ClientRequestResponse";
import { ErrorResponse } from "../../../../../domain/models/ErrorResponse";
import { TripPhotoKind } from "../../../../../domain/models/Photo";
import { Status } from "../../../../../domain/repository/ClientRequestRepository";
import { PhotoItem } from "../../../../components/PhotoStrip";
import { useToast } from "../../../../components/ui";
import { formatErrorMessage } from "../../../../utils/Formatters";
import { pickPhoto } from "../../../../utils/PhotoPicker";
import { DriverTripMapViewModel } from "../DriverTripMapViewModel";

interface Callbacks {
    // Entrega confirmada (con el código o por el cliente): se pasa a calificar
    onFinished: (request: ClientRequestResponse) => void;
    // Viaje cancelado por cualquiera de los dos
    onLeft: () => void;
}

// Estado del viaje del lado del conductor: el paso en que va, avanzar, la prueba de entrega y cancelar
export function useDriverTrip(viewModel: DriverTripMapViewModel, idClientRequest: number, callbacks: Callbacks) {
    const { showToast } = useToast();
    const [request, setRequest] = useState<ClientRequestResponse | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [status, setStatus] = useState<string>(Status.ACCEPTED);
    const [updating, setUpdating] = useState(false);
    const [deliveryPhotos, setDeliveryPhotos] = useState<PhotoItem[]>([]);
    const [deliveryError, setDeliveryError] = useState<string | null>(null);

    // Los avisos del socket llegan a funciones registradas una sola vez: leen lo último por referencia
    const requestRef = useRef<ClientRequestResponse | null>(null);
    const callbacksRef = useRef(callbacks);
    callbacksRef.current = callbacks;
    // El servidor avisa FINISHED a los dos: si el conductor cerró con el código, ese aviso no debe repetir el cierre
    const finished = useRef(false);

    const load = async () => {
        setLoadFailed(false);
        const response = await viewModel.getClientRequestById(idClientRequest);
        if ('id' in response) {
            requestRef.current = response;
            setRequest(response);
            // Si el conductor vuelve al viaje desde "Próximos fletes", sigue en el paso en que iba
            setStatus(response.status);
        } else {
            setLoadFailed(true);
        }
    }

    const finish = () => {
        if (finished.current || !requestRef.current) return;
        finished.current = true;
        callbacksRef.current.onFinished(requestRef.current);
    }

    useEffect(() => {
        load();
        const offCanceled = viewModel.listenerTripCanceled(idClientRequest, (reason) => {
            showToast(`El cliente canceló el viaje${reason ? `: ${reason}` : ''}`, 'error');
            callbacksRef.current.onLeft();
        });
        const offFinished = viewModel.listenerTripFinished(idClientRequest, () => {
            if (finished.current) return;
            showToast('El cliente confirmó que recibió la carga', 'success');
            finish();
        });
        return () => {
            offCanceled();
            offFinished();
        };
    }, [idClientRequest]);

    // Foto con la cámara y subida al viaje; devuelve null si se canceló o falló
    const takeTripPhoto = async (kind: TripPhotoKind): Promise<PhotoItem | null> => {
        const photo = await pickPhoto('camera');
        if (!photo.ok) {
            if (!photo.cancelled) showToast(photo.message, 'error');
            return null;
        }
        const response = await viewModel.uploadTripPhoto(idClientRequest, kind, photo.uri);
        if ('statusCode' in response) {
            showToast(formatErrorMessage(response.message), 'error');
            return null;
        }
        return { key: String(response.id), localUri: photo.uri };
    }

    // Avanza al siguiente estado. Devuelve true si toca abrir la prueba de entrega, que se confirma aparte
    const advance = async (): Promise<boolean> => {
        const next = viewModel.nextStep(status);
        if (!next || updating) return false;
        if (next.status === Status.FINISHED) return true;
        setUpdating(true);
        if (next.status === Status.TRAVELING) {
            showToast('Toma una foto de la carga ya subida al vehículo', 'info');
            const photo = await takeTripPhoto('PICKUP');
            if (!photo) {
                setUpdating(false);
                return false;
            }
        }
        const response = await viewModel.updateStatus(idClientRequest, next.status);
        setUpdating(false);
        if (typeof response !== 'boolean') {
            showToast(formatErrorMessage((response as ErrorResponse).message), 'error');
            return false;
        }
        setStatus(next.status);
        viewModel.emitUpdateStatus(idClientRequest, next.status);
        showToast(next.status === Status.TRAVELING ? 'Carga recogida: sigue la ruta al destino' : 'Le avisamos al cliente que llegaste', 'success');
        return false;
    }

    const addDeliveryPhoto = async () => {
        const photo = await takeTripPhoto('DELIVERY');
        if (photo) setDeliveryPhotos((photos) => [...photos, photo]);
    }

    const deliver = async (code: string) => {
        setUpdating(true);
        setDeliveryError(null);
        const response = await viewModel.deliver(idClientRequest, code);
        setUpdating(false);
        if (response === true) {
            showToast('Entrega confirmada', 'success');
            finish();
        } else {
            setDeliveryError(formatErrorMessage((response as ErrorResponse).message));
        }
    }

    const cancel = async (reason: string) => {
        const response = await viewModel.cancelTrip(idClientRequest, reason);
        if (response === true) {
            showToast('Cancelaste el viaje', 'info');
            callbacksRef.current.onLeft();
        } else {
            showToast(formatErrorMessage((response as ErrorResponse).message), 'error');
        }
    }

    return { request, loadFailed, reload: load, status, updating, deliveryPhotos, deliveryError, advance, addDeliveryPhoto, deliver, cancel };
}
