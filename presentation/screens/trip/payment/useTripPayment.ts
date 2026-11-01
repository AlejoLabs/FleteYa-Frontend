import { useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";
import { PaymentMethod } from "../../../../domain/models/ClientRequest";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { TripPayment } from "../../../../domain/models/TripPayment";
import { useToast } from "../../../components/ui";
import { formatErrorMessage } from "../../../utils/Formatters";
import { TripPaymentViewModel } from "./TripPaymentViewModel";

// Mientras espera un pago por la app, el conductor pregunta cada tanto (el cliente pregunta al volver del checkout)
const VERIFY_EVERY_MS = 6000;

type Busy = 'method' | 'online' | 'verify' | 'cash' | null;

// Estado del pago: carga el flete y el pago, abre el checkout, verifica al volver y escucha cuando el otro paga o cambia de método
export function useTripPayment(viewModel: TripPaymentViewModel, idClientRequest: number, isClient: (request: ClientRequestResponse) => boolean) {
    const { showToast } = useToast();
    const [request, setRequest] = useState<ClientRequestResponse | null>(null);
    const [payment, setPayment] = useState<TripPayment | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [busy, setBusy] = useState<Busy>(null);
    // true desde que el cliente abrió el checkout hasta que vuelve a la app
    const inCheckout = useRef(false);
    const paymentRef = useRef<TripPayment | null>(null);
    paymentRef.current = payment;

    const showError = (response: ErrorResponse) => showToast(formatErrorMessage(response.message), 'error');

    // Si llegó el pago que se esperaba, se avisa una sola vez
    const applyPayment = (next: TripPayment) => {
        const wasPaid = Boolean(paymentRef.current?.paid_at);
        setPayment(next);
        if (!wasPaid && next.paid_at && paymentRef.current) showToast('Pago confirmado', 'success');
    }

    const loadPayment = async () => {
        const response = await viewModel.getPayment(idClientRequest);
        if ('id_client_request' in response) applyPayment(response);
    }

    const load = async () => {
        setLoadFailed(false);
        const [tripResponse, paymentResponse] = await Promise.all([viewModel.getClientRequest(idClientRequest), viewModel.getPayment(idClientRequest)]);
        if (!('id' in tripResponse) || !('id_client_request' in paymentResponse)) {
            setLoadFailed(true);
            return;
        }
        setRequest(tripResponse);
        setPayment(paymentResponse);
    }

    const verify = async (quiet = false) => {
        if (!quiet) setBusy('verify');
        const response = await viewModel.verifyOnline(idClientRequest);
        if (!quiet) setBusy(null);
        if ('id_client_request' in response) {
            applyPayment(response);
            if (!quiet && !response.paid_at && !viewModel.wasDeclined(response)) showToast('Todavía no vemos el pago. Si ya pagaste, espera un momento', 'info');
        } else if (!quiet) {
            showError(response);
        }
    }

    useEffect(() => {
        viewModel.initSocket();
        load();
        const offPayment = viewModel.listenerPaymentChanges(idClientRequest, loadPayment);
        // Al volver del navegador se pregunta por el pago sin que el cliente tenga que tocar nada
        const appState = AppState.addEventListener('change', (state) => {
            if (state === 'active' && inCheckout.current) {
                inCheckout.current = false;
                verify(true);
            }
        });
        return () => {
            offPayment();
            appState.remove();
        };
    }, [idClientRequest]);

    // El conductor espera un pago por la app: se pregunta a la pasarela hasta que llegue
    const waitingOnline = request !== null && payment !== null && !isClient(request) && !payment.paid_at && payment.payment_method === 'WOMPI';
    useEffect(() => {
        if (!waitingOnline) return;
        const timer = setInterval(() => verify(true), VERIFY_EVERY_MS);
        return () => clearInterval(timer);
    }, [waitingOnline]);

    const changeMethod = async (method: PaymentMethod) => {
        if (!payment || payment.payment_method === method || busy) return;
        setBusy('method');
        const response = await viewModel.changeMethod(idClientRequest, method);
        setBusy(null);
        if ('id_client_request' in response) setPayment(response);
        else showError(response);
    }

    const payOnline = async () => {
        setBusy('online');
        const response = await viewModel.startOnline(idClientRequest);
        setBusy(null);
        if (!('checkout_url' in response)) {
            showError(response);
            return;
        }
        inCheckout.current = true;
        try {
            await Linking.openURL(response.checkout_url);
        } catch {
            inCheckout.current = false;
            showToast('No pudimos abrir la página de pago', 'error');
        }
    }

    const confirmCash = async () => {
        setBusy('cash');
        const response = await viewModel.confirmCash(idClientRequest);
        setBusy(null);
        if ('id_client_request' in response) {
            applyPayment(response);
            return true;
        }
        showError(response);
        return false;
    }

    return { request, payment, loadFailed, reload: load, busy, changeMethod, payOnline, verify, confirmCash };
}
